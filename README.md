# Adım Adım KPSS

Kişiye özel ders adımları, konu bağlantıları, ayarlanabilir sayaç, notlar ve deneme kayıtları.

## Gizlilik

Kaynak kod özel GitHub deposunda tutulabilir. Çalışan uygulama Cloudflare D1 veritabanı ve Sites tarafından doğrulanan kullanıcı kimliği gerektirir; statik GitHub Pages yayını bu altyapının yerine geçmez. Özel bir GitHub deposu, Pages sitesinin erişimini otomatik olarak kısıtlamaz.

Uygulama Sites giriş kapısının arkasında çalışır. API, platformun `oai-authenticated-user-id` kimliğini kullanır; her sorgu bu kullanıcıyla sınırlandırılır. Worker’ı bu doğrulama katmanı olmadan internete açmayın. Sites erişim listesini yalnız istenen iki hesapla sınırlayın.

Eski tek kişilik kayıt `study_state` tablosunda korunur. `LEGACY_OWNER_EMAIL` ortam ayarıyla eşleşen doğrulanmış hesabın ilk girişinde kayıt kişisel tabloya kopyalanır. Diğer kullanıcılar boş kayıtla başlar. Ortam ayarını ilk yeni sürüm yayınından önce tanımlayın; gerçek adresi depoya koymayın.

## Yerel geliştirme

Node.js 22.13 veya üstü. `npm ci`, ardından `npm run dev`. Yerel test hesabı üretim hesabından ayrıdır. Şema değişiklikleri için `npm run db:generate`; üretim yayını öncesinde üretilen SQL dosyalarını inceleyin.

`npx tsc --noEmit`, `node scripts/check-study.mjs`, `node scripts/check-companion.mjs` ve `node scripts/check-workspace.mjs` kontrolleri mevcuttur. Sites barındırması için `.openai/hosting.json` içindeki proje kimliği korunur.

## Sayaç

1–180 dakika, duraklat/devam, sıfırla, 10 dakika ekle, ayrı mola. Sıfırlama geçen çalışma süresini kaydeder. Tik atma ve süre kaydı ayrıdır; aktif adımı bitirmek ikisini tek kayıt işleminde tamamlar. Molalar çalışma süresine sayılmaz.

Sesin etkinleştirilmesi dokunma gerektirir. iPhone arka planda veya ekran kilitliyken web alarmı garanti değildir. YouTube kullanırken iPhone Saat uygulamasında da sayaç kurun.

Alıştırmalar özgün temel sorulardır; Pegem/ÖSYM soruları ya da puan tahmini değildir. Konu kontrolünde daha önce görülmemiş kitap soruları kullanılmalıdır.
