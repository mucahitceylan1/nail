/**
 * Presigned PUT for Cloudflare R2 (S3-compatible API).
 * POST /sign  JSON: { bucket, key, contentType }  + Authorization: Bearer <Supabase access_token>
 */
import { AwsClient } from 'aws4fetch';
import * as jose from 'jose';

const ALLOWED_BUCKETS = new Set(['appointment-media', 'site-gallery']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_KEY_LEN = 900;
const PRESIGN_EXPIRES_SEC = 3600;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 80;

const rateBucket = new Map<string, { n: number; reset: number }>();

function rateAllow(ip: string): boolean {
  const now = Date.now();
  let r = rateBucket.get(ip);
  if (!r || now > r.reset) {
    rateBucket.set(ip, { n: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  if (r.n >= RATE_MAX) return false;
  r.n += 1;
  return true;
}

function corsHeaders(env: Env, req: Request): Headers {
  const h = new Headers();
  const origin = req.headers.get('Origin') ?? '';
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length === 0 || allowed.includes(origin)) {
    h.set('Access-Control-Allow-Origin', allowed.length === 0 ? '*' : origin);
  }
  h.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  h.set('Access-Control-Max-Age', '86400');
  return h;
}

function json(env: Env, req: Request, body: unknown, status = 200): Response {
  const h = corsHeaders(env, req);
  h.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(body), { status, headers: h });
}

function keyAllowedForBucket(bucket: string, key: string): boolean {
  if (key.includes('..') || key.startsWith('/')) return false;
  if (bucket === 'appointment-media') return key.startsWith('appointments/');
  if (bucket === 'site-gallery') return key.startsWith('site/');
  return false;
}

export interface Env {
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  SUPABASE_JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!rateAllow(ip)) {
      return json(env, request, { error: 'rate_limited' }, 429);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    if (request.method !== 'POST') {
      return json(env, request, { error: 'method_not_allowed' }, 405);
    }

    const url = new URL(request.url);
    if (url.pathname !== '/sign' && url.pathname !== '/sign/') {
      return json(env, request, { error: 'not_found' }, 404);
    }

    const auth = request.headers.get('Authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) {
      return json(env, request, { error: 'missing_token' }, 401);
    }

    if (!env.SUPABASE_JWT_SECRET || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_ACCOUNT_ID) {
      return json(env, request, { error: 'worker_misconfigured' }, 500);
    }

    try {
      const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
      await jose.jwtVerify(token, secret, { algorithms: ['HS256'] });
    } catch {
      return json(env, request, { error: 'invalid_token' }, 401);
    }

    let body: { bucket?: string; key?: string; contentType?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return json(env, request, { error: 'invalid_json' }, 400);
    }

    const bucket = body.bucket ?? '';
    const key = body.key ?? '';
    const contentType = (body.contentType ?? '').trim().toLowerCase();

    if (!ALLOWED_BUCKETS.has(bucket) || !keyAllowedForBucket(bucket, key) || key.length > MAX_KEY_LEN) {
      return json(env, request, { error: 'invalid_bucket_or_key' }, 400);
    }
    if (!ALLOWED_MIME.has(contentType)) {
      return json(env, request, { error: 'invalid_content_type' }, 400);
    }

    const client = new AwsClient({
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      service: 's3',
      region: 'auto',
    });

    const r2Url = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const objectUrl = `${r2Url}/${bucket}/${key}?X-Amz-Expires=${PRESIGN_EXPIRES_SEC}`;

    const signed = await client.sign(
      new Request(objectUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
      }),
      { aws: { signQuery: true } }
    );

    return json(env, request, { url: signed.url.toString() });
  },
};
