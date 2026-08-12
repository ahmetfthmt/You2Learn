# All2App AI Learning Lab

All2App AI Learning Lab, bir **YouTube video URL’sini** veya **PDF belgesini**, seçilen öğrenme düzeyine uyarlanmış Türkçe bir öğrenme yoluna dönüştürür. Her oluşturma sonunda en az 30 soruluk, anlık geri bildirimli **Ustalık Sınavı (Mastery Exam)** bulunur.

## Temel özellikler

| Alan | Uygulanan davranış |
|---|---|
| Kaynak girişi | YouTube URL’si ya da sürükle-bırak PDF seçimi |
| Öğrenme düzeyi | Başlangıç, Orta ve İleri seçenekleri |
| Kaynak sadakati | Üretim talimatı, kaynak dışı bilgi eklemeyi yasaklar; eksik alanların açıkça belirtilmesini zorunlu kılar |
| Sınav | Dört seçenekli, açıklamalı, senaryo temelli en az 30 soru |
| Sağlayıcılar | Gemini, OpenAI, OpenRouter ve Claude |
| Geçmiş | Tarayıcıdaki IndexedDB’de saklanır; kayıt tekrar üretim yapılmadan açılır |
| Silme | Tekil kayıt ve tüm geçmiş için zorunlu onay diyaloğu |

## Mimari ve gizlilik

Kullanıcı API anahtarı yalnızca kullanıcının tarayıcısındaki `localStorage` alanında tutulur. Anahtar veritabanına, dosyaya, geçmiş kaydına veya ortam değişkenine yazılmaz. Üretim/bağlantı kontrolü sırasında anahtar, bazı sağlayıcıların tarayıcı kökenli istekleri engelleyebilmesi nedeniyle uygulama sunucusu üzerinden **yalnızca ilgili sağlayıcıya iletilir**; sunucu tarafında kalıcılaştırılmaz.

> Bu yaklaşım, anahtarın tarayıcıda tutulması şartını korur; ancak `localStorage` aynı tarayıcı profilindeki betikler tarafından okunabilir. Uygulamayı yalnızca güvenilir cihazlarda kullanın, işiniz bittiğinde **Anahtarı sil** seçeneğini kullanın ve anahtar içeren ekran görüntülerini paylaşmayın.

Geçmiş verileri de kullanıcı tarayıcısında IndexedDB’de tutulur. Başka cihazda görünmez, Render dağıtımı ile taşınmaz ve tarayıcı verileri silindiğinde kaybolur. Bu tercih, kullanıcı talebindeki tarayıcıda saklama gereksinimine uygundur.

## Yerelde çalıştırma

| Gereksinim | Sürüm / not |
|---|---|
| Node.js | 22 veya üstü |
| Paket yöneticisi | pnpm |
| API anahtarı | Kullanıcı kendi Gemini, OpenAI, OpenRouter veya Anthropic anahtarını tarayıcı arayüzünden ekler |

```bash
pnpm install
pnpm dev
```

Ardından yerel adresi açın, **Sağlayıcı Ayarları** üzerinden bir sağlayıcı/model/anahtar tanımlayın ve **Doğrula** düğmesiyle erişimi kontrol edin.

## GitHub’a aktarma

GitHub’da boş bir depo oluşturduktan sonra proje kökünde aşağıdaki komutları çalıştırın:

```bash
git init
git add .
git commit -m "feat: All2App AI Learning Lab"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/DEPO_ADINIZ.git
git push -u origin main
```

`.env` dosyalarını veya kullanıcı API anahtarlarını depoya eklemeyin. Proje `.gitignore` ile yerel gizli ayarları hariç tutacak şekilde hazırlanmıştır.

## Render.com dağıtımı

Depo kökündeki [`render.yaml`](./render.yaml), Render Blueprint akışı için hazırdır.

1. GitHub deponuzu Render hesabınıza bağlayın.
2. Render ana menüsünden **New → Blueprint** seçeneğini açın ve depoyu seçin.
3. Render’ın bulduğu `all2app-ai-learning-lab` servisini oluşturun.
4. İlk dağıtım sonrası oluşan `https://...onrender.com` adresini **Environment** bölümündeki `PUBLIC_APP_URL` değişkenine ekleyin ve yeniden dağıtın. Bu değer OpenRouter isteğinin kaynak üstbilgisi için kullanılır.
5. Uygulamanın kalıcı bir LLM anahtarı ortam değişkenine ihtiyacı yoktur. Her son kullanıcı kendi anahtarını tarayıcıdan sağlar.

`render.yaml`, `pnpm build` komutuyla React istemcisini ve Express/tRPC sunucusunu derler; `pnpm start` komutuyla Render’ın verdiği `PORT` üzerinden çalışır. Hizmet, kök adresten sağlık denetimi yapar.

Kullanılabilen ve özellikle eklenmemesi gereken ortam değişkenlerinin örnekleri için [ortam değişkenleri belgesine](./docs/environment-variables.md) bakın.

## Kaynak ve üretim sınırları

- PDF dosyası **20 MB** ile sınırlıdır; metin tabanlı PDF’lerden en fazla 120.000 karakter işlenir.
- YouTube videosu için erişilebilir altyazı/transkript gerekir. Transkript alınamazsa uygulama üretim yapmaz.
- Model çıktısı JSON şeması, en az üç ders modülü, her soruda dört seçenek ve **en az 30 sınav sorusu** bakımından doğrulanır.
- Modelin kaynakta olmayan bilgi üretmesini tamamen teknik olarak garanti etmek mümkün değildir; buna karşılık sistem talimatı, kaynak dışı bilgi eklemeyi yasaklar ve yanıtı şema/eksiklik denetiminden geçirir. Kritik kullanımlarda sonuçları orijinal kaynakla karşılaştırın.

## Kontrol komutları

```bash
pnpm check
pnpm test
pnpm build
```

## Lisans

MIT
