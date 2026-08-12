import type { LearningLevel, ProviderId, SourceMaterial } from "../shared/learning";

export interface GenerationRequest {
  provider: ProviderId;
  model: string;
  apiKey: string;
  source: SourceMaterial;
  level: LearningLevel;
}

function systemInstruction() {
  return "Sen, yalnızca sağlanan kaynak materyale dayalı Türkçe öğrenme tasarımı uzmanısın. Kaynakta olmayan bir kavramı, örneği, tarihi, formülü veya sonucu kesin bilgi gibi yazma. Kaynak belirsiz ya da eksikse bunu ‘Kaynakta belirtilmiyor’ ifadesiyle açıkça bildir; asla boşlukları internet bilgisi veya tahminle doldurma. Ders içeriği ve sınav soruları kaynakta açıkça yer alan bilgi, ilişki, yöntem veya örneklerden türetilmelidir. Tüm çıktı Türkçe olmalı ve yalnızca geçerli JSON içermelidir.";
}

export function createGenerationPrompt(source: SourceMaterial, level: LearningLevel) {
  const sourceNote = source.wasTruncated
    ? "Kaynak metni teknik sınır nedeniyle kesildi. Yalnızca aşağıdaki metin parçasındaki bilgileri kullan; metnin dışında kalan içeriği varsayma."
    : "Kaynak metnin tamamı aşağıda sağlanmıştır.";

  return `GÖREV: Aşağıdaki ${source.kind === "youtube" ? "YouTube video transkriptini" : "PDF belgesi metnini"} inceleyerek seçilen ${level} düzeyine uygun, etkileşimli bir Türkçe öğrenme uygulaması tasarla.

KAYNAK SADAKATİ ZORUNLUDUR:
1. Bu istekte verilen KAYNAK METİN dışında hiçbir bilgi kullanma.
2. Başlık, ders açıklaması, öğrenme hedefleri, modüller ve sınav soruları yalnızca KAYNAK METİN ile doğrulanabilmelidir.
3. Kaynakta bulunmayan ayrıntıları "tamamlama", uydurma örnek, isim, rakam ya da önkoşul ekleme.
4. En az 30 soru üret. Her soru tam olarak dört seçenek, bir doğru cevap ve kısa fakat kaynak temelli açıklama içersin.
5. Soruların çoğu senaryo, karşılaştırma, uygulama veya neden-sonuç biçiminde eleyici olmalıdır; ancak kaynakta açıkça desteklenmelidir.
6. Çıktı yalnızca aşağıdaki şemaya uygun JSON olsun. Markdown işareti, kod çiti veya açıklama ekleme.

ŞEMA:
{
  "schemaVersion": 1,
  "sourceTitle": "string",
  "sourceSummary": "string",
  "sourceBoundaries": "Kaynağın kapsadığı ve kapsamadığı alanları birer cümleyle açıkla.",
  "level": "${level}",
  "estimatedMinutes": 25,
  "lesson": {
    "title": "string",
    "subtitle": "string",
    "learningObjectives": ["string"],
    "modules": [{
      "title": "string",
      "objective": "string",
      "explanation": "string",
      "keyPoints": ["string"],
      "checkpoint": { "question": "string", "answer": "string", "explanation": "string" }
    }]
  },
  "exam": {
    "title": "Ustalık Sınavı (Mastery Exam)",
    "introduction": "string",
    "questions": [{
      "id": 1,
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "string",
      "competency": "string"
    }]
  }
}

KAYNAK BAŞLIĞI: ${source.title}
KAYNAK TÜRÜ: ${source.kind === "youtube" ? "YouTube videosu" : `PDF belgesi (${source.pageCount ?? "bilinmiyor"} sayfa)`}
KAYNAK DURUMU: ${sourceNote}

--- KAYNAK METİN BAŞLANGICI ---
${source.text}
--- KAYNAK METİN BİTİŞİ ---`;
}

async function parseResponse(response: Response, label: string) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.error?.message || body?.message || `${label} isteği başarısız oldu (${response.status}).`;
    throw new Error(typeof message === "string" ? message : `${label} isteği başarısız oldu.`);
  }
  return body;
}

export async function generateWithProvider(input: GenerationRequest) {
  const apiKey = input.apiKey.trim();
  if (!apiKey) throw new Error("API anahtarı bulunamadı.");
  const system = systemInstruction();
  const prompt = createGenerationPrompt(input.source, input.level);

  if (input.provider === "gemini") {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 16384, temperature: 0.2 },
      }),
    });
    const body = await parseResponse(response, "Gemini");
    const content = body?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
    if (!content) throw new Error("Gemini kullanılabilir bir üretim yanıtı döndürmedi.");
    return content as string;
  }

  if (input.provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: input.model, max_tokens: 16384, temperature: 0.2, system, messages: [{ role: "user", content: prompt }] }),
    });
    const body = await parseResponse(response, "Claude");
    const content = body?.content?.filter((item: { type: string }) => item.type === "text").map((item: { text?: string }) => item.text || "").join("");
    if (!content) throw new Error("Claude kullanılabilir bir üretim yanıtı döndürmedi.");
    return content as string;
  }

  const isOpenRouter = input.provider === "openrouter";
  const response = await fetch(isOpenRouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(isOpenRouter ? { "HTTP-Referer": process.env.PUBLIC_APP_URL || "https://localhost", "X-Title": "All2App AI Learning Lab" } : {}),
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.2,
      max_tokens: 16384,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
    }),
  });
  const body = await parseResponse(response, isOpenRouter ? "OpenRouter" : "OpenAI");
  const content = body?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${isOpenRouter ? "OpenRouter" : "OpenAI"} kullanılabilir bir üretim yanıtı döndürmedi.`);
  return content as string;
}

export async function verifyProviderConnection(input: Pick<GenerationRequest, "provider" | "model" | "apiKey">) {
  const apiKey = input.apiKey.trim();
  if (!apiKey) throw new Error("API anahtarı bulunamadı.");
  const verificationPrompt = "Yalnızca şu JSON nesnesini döndür: {\"ok\":true}";

  if (input.provider === "gemini") {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: verificationPrompt }] }], generationConfig: { responseMimeType: "application/json", maxOutputTokens: 64, temperature: 0 } }),
    });
    await parseResponse(response, "Gemini");
    return { valid: true };
  }

  if (input.provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: input.model, max_tokens: 64, temperature: 0, messages: [{ role: "user", content: verificationPrompt }] }),
    });
    await parseResponse(response, "Claude");
    return { valid: true };
  }

  const isOpenRouter = input.provider === "openrouter";
  const response = await fetch(isOpenRouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(isOpenRouter ? { "HTTP-Referer": process.env.PUBLIC_APP_URL || "https://localhost", "X-Title": "All2App AI Learning Lab" } : {}),
    },
    body: JSON.stringify({ model: input.model, max_tokens: 64, temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "user", content: verificationPrompt }] }),
  });
  await parseResponse(response, isOpenRouter ? "OpenRouter" : "OpenAI");
  return { valid: true };
}
