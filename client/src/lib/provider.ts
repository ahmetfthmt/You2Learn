import type { LearningPayload, ProviderId, ProviderSettings } from "@shared/learning";

export const PROVIDERS: Record<ProviderId, { label: string; defaultModel: string; helper: string }> = {
  gemini: { label: "Gemini", defaultModel: "gemini-2.5-flash", helper: "Google AI Studio anahtarı" },
  openai: { label: "OpenAI", defaultModel: "gpt-4.1-mini", helper: "OpenAI platform anahtarı" },
  openrouter: { label: "OpenRouter", defaultModel: "google/gemini-2.5-flash", helper: "OpenRouter anahtarı" },
  anthropic: { label: "Claude", defaultModel: "claude-3-5-haiku-latest", helper: "Anthropic Console anahtarı" },
};

const SETTINGS_KEY = "all2app.provider-settings.v1";

export function getStoredProviderSettings(): ProviderSettings {
  const fallback: ProviderSettings = { provider: "gemini", model: PROVIDERS.gemini.defaultModel, apiKey: "" };
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<ProviderSettings>;
    if (!parsed.provider || !PROVIDERS[parsed.provider]) return fallback;
    return { provider: parsed.provider, model: parsed.model?.trim() || PROVIDERS[parsed.provider].defaultModel, apiKey: parsed.apiKey || "" };
  } catch {
    return fallback;
  }
}

export function saveProviderSettings(settings: ProviderSettings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearProviderSettings() {
  window.localStorage.removeItem(SETTINGS_KEY);
}

function stripCodeFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}

export function parseAndValidateLearningPayload(value: string): LearningPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(value));
  } catch {
    throw new Error("Sağlayıcı geçerli JSON döndürmedi. Aynı kaynağı yeniden deneyin veya başka bir model seçin.");
  }
  const data = parsed as Partial<LearningPayload>;
  const questions = data.exam?.questions;
  if (!data.lesson || !Array.isArray(data.lesson.modules) || data.lesson.modules.length < 3) {
    throw new Error("Öğrenme içeriği yeterli modül içermiyor. Lütfen tekrar deneyin.");
  }
  if (!Array.isArray(questions) || questions.length < 30) {
    throw new Error("Ustalık Sınavı en az 30 soru içermelidir. Sağlayıcı eksik yanıt verdi; lütfen tekrar deneyin.");
  }
  const invalidQuestion = questions.find((question) => !question || !Array.isArray(question.options) || question.options.length !== 4 || !Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3);
  if (invalidQuestion) throw new Error("Ustalık Sınavı soru yapısı geçerli değil. Lütfen farklı bir modelle yeniden deneyin.");
  if (data.exam?.title !== "Ustalık Sınavı (Mastery Exam)") throw new Error("Sınav adı beklenen biçimde üretilmedi. Lütfen yeniden deneyin.");
  return data as LearningPayload;
}
