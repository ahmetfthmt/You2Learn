# Doğrulama Notları

## Arayüz incelemesi

2026-08-12 tarihinde masaüstü ve 390 px genişlikte mobil görünümde giriş, geçmiş ve boş durum ekranı doğrulandı. Boş durum alanı, ürünün temel yolunu **Kaynak → Öğrenme yolu → Ustalık** olarak görselleştirir. Sol panelde kaynak türü, düzey seçimi, üretme eylemi ve geçmiş yönetimi görünür durumdadır; mobil görünümde bu alanlar tek sütunda sıralanır.

Paylaşım bağlantısının geçersiz olduğu durumda `/paylas/:slug` hedef sayfası 390 px mobil genişlikte doğrulandı; kullanıcıya açıklayıcı bir durum metni ve ana sayfaya dönüş eylemi sunuluyor.

Sertifika bağlantısının geçersiz olduğu durumda `/sertifika/:slug` hedef sayfası 390 px mobil genişlikte doğrulandı; kullanıcıya açıklayıcı bir durum metni ve ana sayfaya dönüş eylemi sunuluyor.

## Otomatik kontroller

| Komut | Sonuç |
|---|---|
| `pnpm check` | Başarılı |
| `pnpm test` | 15 test dosyası, 26 test başarılı |
| `pnpm build` | Başarılı |

Testler; oturum kapatma işlemini, YouTube URL doğrulamasını, kaynak sadakati istemini, sağlayıcı çıktı şeması denetimini, üretim isteği sınırlarını, ana ekran geçmişinden yeniden üretimsiz yüklemeyi, paylaşım metnini, sosyal bağlantıları, genel paylaşım sayfasını, uygulama yönlendirmesini, rozet düzeyi hesaplamasını, sertifika görünümünü ve sertifika paylaşım akışını kapsar.
