# Nail Lab. — Proje özeti ve yapılacaklar

Bu dosya, projede **şu ana kadar nelerin hazırlandığını** ve **canlıya alırken veya sonrasında nelere dikkat etmeniz gerektiğini** herkesin anlayabileceği şekilde özetler. Teknik detay isteyenler için bazı bölümlerde kısa notlar da vardır.

---

## Bu belge kime hitap ediyor?

- **İşletme / stüdyo sahibi:** Sitenin arama motorları ve sosyal medyada nasıl göründüğü, eksik kalan tek tıklık ayarlar.
- **Geliştirici veya hosting yöneten kişi:** Ortam değişkenleri, build ve dosya konumları.

---

## Şu ana kadar yapılanlar (özet)

### 1. Site içi arama ve paylaşım (SEO temeli)

- Her önemli sayfada **başlık, açıklama ve anahtar kelimeler** dil seçimine göre (Türkçe, İngilizce, Rusça, Arapça) ayarlanabiliyor.
- **Canonical** ve **hreflang** ile arama motorlarına “asıl adres bu” ve “bu sayfanın diğer dilleri şunlar” bilgisi veriliyor.
- **Open Graph** ve **Twitter** kartları: Link paylaşıldığında başlık, açıklama ve görsel önizlemesi için meta etiketler var.
- Varsayılan paylaşım görseli: **`public/og-image.png`** (1200×630 piksel, sosyal ağların sevdiği boyut).

### 2. Yapılandırılmış veri (Google için işletme bilgisi)

- Sitede **JSON-LD** ile işletme tipi bilgisi (güzellik / tırnak stüdyosu), telefon, Instagram, şehir/ülke gibi alanlar tanımlandı.
- Bu, arama sonuçlarında zengin görünüm ve yerel aramada yardımcı olabilir; garanti değildir, Google kendi kurallarına göre kullanır.

### 3. Yönetim paneli ve botlar

- **`robots.txt`:** Genel sayfalar taranabilir; **`/admin`** yolları taranmaması için işaretlendi.
- **Yönetim paneli ve giriş sayfası** tarayıcıya “**indexleme**” (`noindex`) sinyali de veriyor; böylece hem dosya hem sayfa düzeyinde çift önlem var.

### 4. Site haritası (sitemap)

- **Production build** sırasında, ortamda doğru adres tanımlıysa **`sitemap.xml`** üretiliyor; tüm diller ve ana sayfalar (hizmetler, randevu, galeri, bakım rehberi) listeleniyor.
- Adres tanımlı değilse sitemap oluşturulmaz; `robots.txt` içinde buna dair kısa bir not kalır.

### 5. Teknik altyapı (kısa)

- React tabanlı tek sayfa uygulaması (SPA); meta bilgiler **`react-helmet-async`** ile güncelleniyor.
- PWA (manifest, çevrimdışı önbellek) yapılandırması var; paylaşım görseli önbelleğe dahil edilecek şekilde listeye eklendi.
- İletişim bilgileri (telefon, Instagram) tek merkezden **`src/constants/contact.ts`** üzerinden kullanılıyor; yapılandırılmış veri de buradaki bilgilerle uyumlu.

---

## Bundan sonra sizin yapmanız gerekenler

### Zorunlu sayılabilecek (canlı site için)

| Ne? | Neden? |
|-----|--------|
| **`.env` dosyasına `VITE_SITE_URL` ekleyin** | Örnek: `https://www.sizin-alanadiniz.com` (sonunda **eğik çizgi olmasın**). Böylece canonical linkler, JSON-LD’deki site adresi ve **production build** sonrası **sitemap + robots içindeki Sitemap satırı** doğru üretilir. |
| **Build’i bu değişkenle alın** | Hosting’de deploy komutunuzda ortam değişkeni tanımlı olmalı; aksi halde sitemap üretilmez veya yanlış kök adres kullanılır. |

### İçerik ve marka (önerilen)

| Ne? | Neden? |
|-----|--------|
| **`public/og-image.png` dosyasını isteğe göre değiştirin** | Şu an metin ağırlıklı genel bir görsel. Kendi fotoğrafınız veya tasarımcı çıktınız (yine 1200×630 veya yakın oran) paylaşımlarda daha profesyonel durur. |
| **Telefon / Instagram / adres** | `src/constants/contact.ts` ve gerekiyorsa `STUDIO_GEO` ile footer ve SEO verileri uyumlu kalsın diye güncel tutun. |

### Bilmeniz iyi olur (teknik sınır)

- Site tamamen tarayıcıda çalışan bir uygulama olduğu için, **JavaScript çalıştırmayan** eski veya sınırlı botlar bazen sadece boş bir iskelet görebilir. Arama optimizasyonu sizin için kritikse ileride **ön render (prerender)** veya **sunucu tarafı render (SSR)** düşünülebilir; bu, ayrı bir proje adımıdır.

---

## Dosya ve ayar referansı (hızlı)

| Konu | Nerede? |
|------|---------|
| Site kök adresi (canonical, sitemap) | Ortam: **`VITE_SITE_URL`** — örnek: `.env.example` |
| Build sırasında sitemap / robots yazımı | `vite-plugin-seo-build.ts`, `vite.config.ts` içinde eklenti olarak |
| Sayfa başlıkları, açıklamalar, anahtar kelimeler | `src/i18n/locales/*.json` (ilgili sayfa blokları + `seo_keywords`) |
| Ortak SEO bileşeni | `src/components/SEO.tsx` |
| İşletme şeması (JSON-LD) | `src/components/StructuredDataLocalBusiness.tsx` |
| Statik robots (geliştirme / kopya) | `public/robots.txt` — production’da build çıktısı güncelleyebilir |
| Paylaşım görseli | `public/og-image.png` |

---

## Kısa kontrol listesi (yayına çıkmadan)

- [ ] Canlı alan adı **`VITE_SITE_URL`** olarak tanımlı mı?
- [ ] Production build sonrası **`dist/sitemap.xml`** ve **`dist/robots.txt`** sunucuda erişilebilir mi? (Örn. `https://siteniz.com/sitemap.xml`)
- [ ] İletişim bilgileri güncel mi?
- [ ] İsteniyorsa **`og-image.png`** markaya özel mi?

---

*Bu özet, proje geliştikçe güncellenebilir. Son büyük eklemeler: çok dilli SEO anahtar kelimeleri, OG görseli, JSON-LD, admin noindex, koşullu sitemap ve site kökü için `VITE_SITE_URL`.*
