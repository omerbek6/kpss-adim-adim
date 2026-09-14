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

## Kademeli soru çalışması

Bölme–Bölünebilme: 20 temel/orta + 15 sınav tarzı + 5 zor özgün soru, 10/10/10/5/5 soruluk setler. Son beş soru isteğe bağlıdır. Rasyonel Sayılar ve Oran–Orantı için önceki onar soru korunur. Süreler öğrenme tahminidir; otomatik süre sınırı veya sınav puanı tahmini değildir.

Anlatım adımındaki bitirme düğmesi aynı kayıtta anlatım tikini koyar ve o konunun soru çalışmasını açar. Bugün ekranındaki soru kartları ve Konular içindeki düğme de erişim sağlar. Soru çözmek planı yeniden üretmez, konu kontrolü tikini otomatik koymaz. Çalışma açılırken aktif sayacın geçen süresi korunur.

Sorular ve açıklamalar statiktir (`lib/question-bank.ts`, `lib/questions/division.json`); cevap kontrolü tarayıcıda yapılır, hiçbir AI servisi çağrılmaz. Cevap anahtarının kaynak kodda bulunması normaldir; bu bir güvenli sınav sistemi değildir. Ekranda cevap ve çözüm başlangıçta gizlidir.

`quizProgress` ve `activeQuiz`, mevcut kullanıcıya özel D1 kaydının isteğe bağlı alanlarıdır; şema veya eski tablo değişmez. Seçilen ama henüz kontrol edilmeyen cevap, son soru, set, ilk sonuç, tekrar sayısı ve yardım durumu kalıcıdır. Eski `practiceAnswers` silinmez: aynı ilk on soruya sabit kimlikle aktarılır. Sorunun kimliği değiştirilmemeli veya başka soru için yeniden kullanılmamalıdır.

Başarı yüzdesi ilk çalışmada yardımsız doğru sayısı / ilk çalışılan soru sayısıdır. Kontrol öncesi çözüm açmak “çözümle öğrenme”dir; yüzdeyi doğru olarak artırmaz. Kontrolden sonra çözüm okumak yardımsız doğruyu bozmaz. Yanlış/yardımlı sorular tekrar listesine girer. Yardımsız doğru tekrar listeden çıkarır, ilk sonucu ve eski yanlış sayısını silmez. Kayıt hatasında değişiklik geri alınır; eski kayıt korunur, kullanıcı tekrar yükleyebilir.

Yeni konu (ör. EBOB–EKOK) eklemek için özgün soru veri dosyasını ve `questionBanks` içindeki konusunu/setlerini kaydetmek yeterlidir. Kalıcı soru kimlikleri, beş benzersiz seçenek ve tek doğru cevap kullanılmalı; veri ve matematik testleri eklenmelidir. Aynı bileşen, doğrulama ve kayıt akışı yeniden kullanılır. Mevcut sürüm EBOB–EKOK sorusu içermez.

Kontroller: `node scripts/check-quiz.mjs` durum geçişlerini, tüm 60 soruyla kayıt boyutunu ve eski verilerle uyumu sınar; `node scripts/check-division-math.mjs` 30 ek soruyu bağımsız aritmetik/tarama ile doğrular. İlk on sorunun kimlik, seçenek ve anahtar eşlemesi de test edilir. `check-workspace.mjs` aynı kaydın API'de hesaplara göre ayrılmasını ve eşzamanlı yazma korumasını kontrol eder.
