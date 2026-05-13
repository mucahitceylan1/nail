# Upload presign Worker (Cloudflare)

Source: `workers/upload-sign/`. Deploy from that directory:

```bash
cd workers/upload-sign
npm install
npx wrangler secret put SUPABASE_JWT_SECRET
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
```

Set `R2_ACCOUNT_ID` in `wrangler.toml` `[vars]` or via dashboard, then:

```bash
npm run deploy
```

Point the Vite app at the worker base URL (no trailing slash) as `VITE_UPLOAD_SIGN_URL`. The client calls `POST {base}/sign` with `Authorization: Bearer <Supabase session JWT>` and JSON `{ "bucket", "key", "contentType" }`.

`SUPABASE_JWT_SECRET` must be the project’s **JWT secret** (Supabase Dashboard → Project Settings → API → *JWT Secret* / legacy HS256). If it does not match the app’s project, `/sign` returns `401` with `{"error":"invalid_token"}` and the Vite app falls back to Supabase Storage — then set `VITE_SITE_GALLERY_USE_SUPABASE_PUBLIC_URL=true` in `.env` until the secret is fixed, so gallery images are not linked to R2 `pub-…r2.dev` URLs that have no object.

Allowed buckets: `appointment-media` (keys must start with `appointments/`), `site-gallery` (keys must start with `site/`). MIME types: `image/jpeg`, `image/png`, `image/webp`.

Optional: set `ALLOWED_ORIGINS` in `wrangler.toml` `[vars]` to a comma-separated list of browser origins; if empty, CORS allows `*`.

If objects are served from R2 public URLs instead of Supabase Storage, set `VITE_PUBLIC_MEDIA_BASE_URL` in the web app so `image_url` values resolve correctly.

See also [docs/R2_ve_operasyonel_kurulum.md](../../docs/R2_ve_operasyonel_kurulum.md).
