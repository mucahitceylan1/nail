/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Same role as anon key on newer Supabase projects (publishable default key). */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Canonical site origin for SEO (e.g. https://www.example.com) — no trailing slash */
  readonly VITE_SITE_URL?: string;
  /** Optional allowlist for admin login (comma-separated emails). */
  readonly VITE_ADMIN_EMAILS?: string;
  /** Cloudflare Worker base URL (no trailing slash); client calls `{base}/sign` for R2 presigned PUT. */
  readonly VITE_UPLOAD_SIGN_URL?: string;
  /**
   * Optional public base when a CDN serves `{base}/{bucket}/{path}` (path segments encoded).
   * For Cloudflare R2 `*.r2.dev` (one host per bucket), use the per-bucket vars below instead.
   */
  readonly VITE_PUBLIC_MEDIA_BASE_URL?: string;
  /** R2 public URL for `site-gallery` only (e.g. `https://pub-xxxxx.r2.dev`). */
  readonly VITE_PUBLIC_MEDIA_BASE_URL_SITE_GALLERY?: string;
  /**
   * If true, `site-gallery` public URLs use Supabase Storage `getPublicUrl` (ignore R2 base above).
   * Use when uploads fall back to Storage (e.g. Worker `/sign` returns 401 `invalid_token`) but R2 env is still set.
   */
  readonly VITE_SITE_GALLERY_USE_SUPABASE_PUBLIC_URL?: string;
  /** R2 public URL for `appointment-media` only. */
  readonly VITE_PUBLIC_MEDIA_BASE_URL_APPOINTMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
