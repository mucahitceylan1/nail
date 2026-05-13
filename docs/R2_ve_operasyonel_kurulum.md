# R2, Worker ve operasyonel kurulum — size düşen işler

Bu dosya, geliştirme tamamlandığında **sizin** Cloudflare ve Supabase taraflarında yapmanız gereken adımları listeler. Repo içindeki Worker kodu: **`workers/upload-sign/`** (ayrıntı için **`workers/README.md`**).

## 1) Cloudflare R2

1. Cloudflare Dashboard → **R2** → iki bucket oluşturun; bu projede Supabase Storage ile uyumlu isimler: **`appointment-media`**, **`site-gallery`** (migration `003` ile aynı isimler).
2. **S3 API erişimi** için R2 → *Manage R2 API Tokens* → Object Read & Write yetkili token oluşturun; **Access Key ID** ve **Secret Access Key**’i güvenli yerde saklayın (commit etmeyin).
3. İsteğe bağlı: **Custom Domain** veya **Public development URL** — halka açık galeri bucket’ı için ziyaretçilerin göreceği kalıcı bir taban URL (public read).

## 2) Cloudflare Worker (presigned yükleme)

1. Workers & Pages → **Create application** → Worker; R2 bucket’larına **binding** ekleyin (ör. `APPOINTMENT_BUCKET`, `GALLERY_BUCKET`).
2. Worker **Secrets** (Settings → Variables): `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID` (gerekirse), Supabase **JWT secret** veya imza doğrulama için kullanılacak ortak secret (uygulama README’sinde netleştirilecek).
3. **CORS**: Worker’da yalnızca üretim admin paneli ve (gerekirse) public site `Origin` değerlerine izin verin.
4. Worker’ı deploy ettikten sonra URL’yi kopyalayın → Vite `.env` içinde `VITE_UPLOAD_SIGN_URL` olarak kullanılacak (sadece bu URL tarayıcıda kalır; R2 secret’ları Worker’da kalır).

## 3) Supabase

1. **Auth**: Admin kullanıcı e-posta/şifre ile oluşturulmuş olsun; planlanan `admin_users` satırındaki `user_id` bu kullanıcıyla eşleşsin.
2. **SQL migration**: Geliştirici `003` (veya sıradaki) migration’ı uygulayacak; siz yalnızca Dashboard → SQL Editor ile çalıştırılacak dosyayı onaylayın veya `supabase db push` kullanıyorsanız link’li projeye push edin.
3. **Storage**: Hibrit kullanımda Supabase Storage bucket’ları da migration ile oluşabilir; tamamen R2’ye geçişte galeri ve randevu dosyaları Worker üzerinden gider.

## 4) Ortam değişkenleri (.env)

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` veya `VITE_SUPABASE_PUBLISHABLE_KEY`
- İsteğe bağlı `VITE_ADMIN_EMAILS` (allowlist)
- `VITE_UPLOAD_SIGN_URL` = Worker taban adresi (presign endpoint’i ile birleştirilecek path uygulama içinde tanımlı olacak)

## 5) E-posta (sonraki faz)

Randevu onay / red / tamamlandı bildirimleri **bu fazın sonunda** ayrı entegrasyon olarak planlanmıştır. SMTP veya transactional e-posta sağlayıcısı (Resend, SendGrid vb.) seçildiğinde Worker veya Supabase Edge Function üzerinden tetiklenebilir.

## 6) Mobil arayüz

**Bilinçli olarak bu fazda yapılmayacaktır.** Admin takvim ve timeline masaüstü önceliklidir; mobil özel kırılım (gün seçici, tab bar yoğunluğu) sonraki iterasyona bırakılmıştır.

## 7) Kontrol listesi (go-live öncesi)

- [ ] R2 bucket’lar oluşturuldu ve Worker binding’leri doğru
- [ ] Worker secrets tanımlı, CORS kısıtlı
- [ ] `VITE_UPLOAD_SIGN_URL` ile admin panelden test yükleme başarılı
- [ ] Supabase migration’lar uygulandı, `admin_users` + Auth kullanıcı eşleşiyor
- [ ] Pazar günü + çalışma saatleri (10–19, Pzt–Cmt) randevu akışında doğrulandı
