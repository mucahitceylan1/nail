# Nail Lab. by İldem 💅✨

Modern, minimal ve offline yetenekli bir "Premium Nail Studio" yönetim uygulaması ve vitrin web sitesi.

## Proje Özeti
Bu proje, bağımsız (solo) çalışan profesyonel bir tırnak uzmanı (Beauty Master) için uçtan uca özel olarak kodlanmıştır. Alışılmış klişe şablonlardan uzaklaşarak, sade ve kusursuz **"Refined Dark Luxury"** marka algısını sunar. 

1. **Public Site (Vitrink):** Müşterilerin hizmetleri, fiyatları inceleyip akıllı algoritmalarla randevu talep ettiği platform.
2. **Admin Panel (Konsol):** Uzmanın kendi müşterilerini, randevularını, gelir/giderlerini ve çalışma fotoğraflarını yönettiği güçlü dashboard sistemi.

---

## 🚀 Özellikler

### Müşteri Vitrini (Public)
* **Akıcı Deneyim:** Single Page App (SPA) mimarisi ve `Framer Motion` destekli akıcı sayfa, hover ve etkileşim animasyonları.
* **Akıllı Randevu Sihirbazı:** 3 Adımlı (Step-by-step) akıllı form tasarımı; geçmiş günleri, saatleri ve dolu randevu slotlarını otomatik kitleyen çakışma algoritması.
* **Hizmet Listesi:** Fiyat ve süre detayına göre otomatik kategorize edilen esnek hizmet menüleri.
* **Galeri (Öncesi/Sonrası):** Sadece admince onaylanıp yüklenen çalışma resimlerini etiketler ile listeleme ve "Before/After" mantığına göre inceleme lüksü.
* **Koyu Lüks Tema:** "Headless UI" kullanılarak sıfırdan oluşturulan `CSS` token'ları; saf siyah `#0A0A0A` zemin, "rose-gold" `#C9A96E` vurgular ve *Playfair Display* zarif tipografisi.

### Yönetim Paneli (Admin) - (`/admin/login`)
*(Supabase Auth zorunludur)*
* **Sürükle-Bırak Hizmet Yönetimi:** Vitrinde sergilenen hizmetleri `@dnd-kit/core` modülü üzerinden saniyeler içinde önceliklendirerek sürükleme, anlık fiyat değiştirme yeteneği.
* **Kesintisiz CRM Mimarisi:** Müşteri notları, müşteri spesifik geçmiş randevuları, fotoğraf albümü ve müşteri değeri (Lifetime Value) hesaplama sistemi.
* **Finans Takibi:** Sadece basit gelir-gider girişiyle aylık ve haftalık ciro hesaplamasına izin veren; sistem randevu kabul ettiğinde otomatik gelir fişi oluşturan mikro-muhasebe aracı.
* **Sıfır Bekleme (Offline First):** Yapılan her kayıt `Zustand` ve tarayıcı storage'ı aracılığıyla anında cihaza kaydedilir, sunucu istek gecikmesi (latency) sıfırdır, internetiniz yavaşlasa dahi sistem kusursuz kullanılmaya devam eder.

---

## Supabase

`.env` içinde `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` tanımlayın; admin girişi **Supabase Auth** (e-posta + şifre) ile yapılır.
İsteğe bağlı olarak `VITE_ADMIN_EMAILS` (virgülle ayrılmış) ile frontend tarafında admin allowlist tanımlayabilirsiniz.

Şema: `supabase/migrations/001_initial.sql` (Supabase SQL Editor veya MCP `apply_migration` ile uygulanabilir). Örnek proje: **naillab** (`fbldwiuidzuprzgwisex`).
Güvenlik sıkılaştırması için ayrıca `supabase/migrations/002_admin_hardening.sql` migration’ını da uygulayın.

**Authentication → Users** üzerinden en az bir kullanıcı oluşturun, ardından kullanıcıyı `admin_users` tablosuna ekleyin:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@ornek.com';
```

---

## 🛠️ Teknik Altyapı (Tech Stack)

Uygulamanın mimarisi, güvenli ve sürdürülebilir olması adına 10/10 bir Frontend disiplini ve tamamen `Strict TypeScript` kod tabanı ile kurgulanmıştır.

* **Framework:** React 19 + Vite
* **Dil:** TypeScript (Sıfır `any` hatası, tam statik kontrol)
* **State Yönetimi:** Zustand (+ isteğe bağlı LocalStorage veya Supabase senkron)
* **Stillendirme:** Tailwind CSS v4 + Katı CSS Değişkenleri (Variables)
* **İkonlar:** Lucide React
* **Router:** React Router Dom v7 
* **Etkileşim:** Framer Motion, Dnd-Kit

---

## 💻 Kurulum ve Çalıştırma

Proje kodunu bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/mucahitceylan1/nail.git
   cd nail
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Not: React 19 ile dnd-kit peer conflict'lerini bypass etmek için legacy-peer kurulumu yapılması tavsiye edilir.)*

3. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   *Tarayıcınızda `http://localhost:5173` dizini üzerinden projeye erişebilirsiniz.*

4. **Production Build (Statik Dağıtım İçin):**
   ```bash
   npm run build
   ```
   *Hazırlanan paketi Vercel/Netlify veya herhangi bir statik sunucuda SPA yönlendirmeleri hazır (`vercel.json` / `netlify.toml` desteğiyle) yayına alabilirsiniz.*

---

## 🛡️ Güvenlik ve Uyarılar
- MVP (Pilot Test) kullanımı seviyesinde olduğu için tüm dosyalar sistem önbelleğinde (localStorage) tutulmaktadır. Cihaz hafızası sıfırlandığında veriler kaybolur. Uzun vadeli kullanımda kod modülerliği hiç etkilenmeden yalnızca backend API (Örnek: *Supabase* veya *Firebase*) linklerinin takılması, projenin kalıcı SaaS olarak yayına alınmasına yeterlidir.
- Admin portaline ilk defa giriş yaptığınızda token atamaları sorunsuz çalışacaktır ancak açık unutma durumlarında (fiziksel hırsızlık risklerine karşı) Session Expiry kurmanız önerilir.

---

**Coded with 🤍 by AI Pair Programmer**
