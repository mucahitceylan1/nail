import { supabase } from './supabase';

const trimSlash = (s: string) => s.replace(/\/+$/, '');

export type SignPayload = { bucket: string; key: string; contentType: string };

/**
 * Upload binary to appointment-media / site-gallery via Supabase client,
 * or presigned PUT when `VITE_UPLOAD_SIGN_URL` + active session (R2 / Worker).
 */
export async function uploadWithSignOrSupabase(
  bucket: string,
  storagePath: string,
  body: Blob,
  contentType: string
): Promise<void> {
  const base = import.meta.env.VITE_UPLOAD_SIGN_URL as string | undefined;
  if (base?.trim() && supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Oturum gerekli (yükleme imzası)');

      const res = await fetch(`${trimSlash(base)}/sign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucket, key: storagePath, contentType } satisfies SignPayload),
      });
      const t = await res.text();
      if (res.ok) {
        const { url } = JSON.parse(t) as { url: string };
        const put = await fetch(url, { method: 'PUT', body, headers: { 'Content-Type': contentType } });
        if (!put.ok) throw new Error(`Yükleme başarısız: ${put.status}`);
        return;
      }
      // Worker `SUPABASE_JWT_SECRET` must match project JWT secret; mismatch → 401 — fall back to Storage.
      if (res.status === 401) {
        console.warn('upload-sign: 401; falling back to Supabase Storage', t);
      } else {
        throw new Error(t || `Presign hatası: ${res.status}`);
      }
    } catch (err) {
      console.warn('upload-sign: fetch failed; falling back to Supabase Storage', err);
      // Fall through to Supabase Storage logic below
    }
  }


  if (!supabase) throw new Error('Supabase yapılandırılmadı');
  const { error } = await supabase.storage.from(bucket).upload(storagePath, body, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
}

const encObjectPath = (path: string) =>
  path.split('/').map((seg) => encodeURIComponent(seg)).join('/');

const isTruthyStr = (val: string | undefined): boolean =>
  ['1', 'true', 'yes'].includes(String(val ?? '').trim().toLowerCase());

/**
 * Public URL for an object in a Supabase Storage bucket.
 *
 * - **Cloudflare R2** “Public Bucket URL” (`https://pub-….r2.dev`): one hostname per bucket; set
 *   `VITE_PUBLIC_MEDIA_BASE_URL_SITE_GALLERY` / `VITE_PUBLIC_MEDIA_BASE_URL_APPOINTMENT` (no trailing slash).
 * - **Single CDN** that mirrors `/{bucket}/{path}`: set only `VITE_PUBLIC_MEDIA_BASE_URL`.
 * - If uploads fall back to Supabase Storage while R2 base env is still set (e.g. Worker `/sign` 401),
 *   set `VITE_SITE_GALLERY_USE_SUPABASE_PUBLIC_URL=true` so `site-gallery` uses `getPublicUrl` instead of R2.
 */
export function publicUrlForBucketPath(bucket: string, path: string): string {
  const useSupabaseForSite = isTruthyStr(import.meta.env.VITE_SITE_GALLERY_USE_SUPABASE_PUBLIC_URL as string | undefined);
  const useSupabaseForAppt = isTruthyStr(import.meta.env.VITE_APPOINTMENT_MEDIA_USE_SUPABASE_PUBLIC_URL as string | undefined);

  if (bucket === 'site-gallery' && useSupabaseForSite && supabase) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  if (bucket === 'appointment-media' && useSupabaseForAppt && supabase) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  const siteRoot = (import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL_SITE_GALLERY as string | undefined)?.trim();
  const apptRoot = (import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL_APPOINTMENT as string | undefined)?.trim();
  const legacyRoot = (import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL as string | undefined)?.trim();

  if (bucket === 'site-gallery' && siteRoot) {
    return `${trimSlash(siteRoot)}/${encObjectPath(path)}`;
  }
  if (bucket === 'appointment-media' && apptRoot) {
    return `${trimSlash(apptRoot)}/${encObjectPath(path)}`;
  }

  if (legacyRoot) {
    const enc = encObjectPath(path);
    return `${trimSlash(legacyRoot)}/${encodeURIComponent(bucket)}/${enc}`;
  }
  if (!supabase) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
