# Ortam Değişkenleri

Bu proje, LLM sağlayıcı anahtarlarını sunucu ortamına koymaz. Her kullanıcı kendi anahtarını uygulama arayüzünde, kendi tarayıcısı için tanımlar.

| Değişken | Gerekli | Örnek | Kullanım |
|---|---:|---|---|
| `PUBLIC_APP_URL` | OpenRouter için önerilir | `https://all2app-ai-learning-lab.onrender.com` | OpenRouter’ın uygulama kaynağını tanımasına yardımcı olan `HTTP-Referer` üstbilgisinde kullanılır. |
| `PORT` | Hayır | Render tarafından otomatik atanır | Express sunucusunun dinleyeceği bağlantı noktası. Render bunu otomatik sağlar. |
| `NODE_ENV` | Hayır | `production` | Üretim komutunda otomatik olarak atanır. |

> **Eklemeyin:** `GEMINI_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY` veya `ANTHROPIC_API_KEY`. Bu anahtarlar kullanıcıya ait olup uygulama ayarlarındaki tarayıcı saklama alanında tutulur; sunucuda kalıcı olarak saklanmaz.

Render’da `PUBLIC_APP_URL` değerini, ilk dağıtım sonrası oluşan HTTPS adresinizle güncelleyin.
