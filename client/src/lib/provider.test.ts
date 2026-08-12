import { describe, expect, it } from "vitest";
import { parseAndValidateLearningPayload } from "./provider";

function validPayload() {
  const questions = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    question: `Soru ${index + 1}`,
    options: ["A", "B", "C", "D"],
    correctIndex: 0,
    explanation: "Kaynak temelli açıklama.",
    competency: "Uygulama",
  }));
  return JSON.stringify({
    schemaVersion: 1,
    sourceTitle: "Kaynak",
    sourceSummary: "Özet",
    sourceBoundaries: "Sınırlar",
    level: "Başlangıç",
    estimatedMinutes: 30,
    lesson: { title: "Ders", subtitle: "Alt başlık", learningObjectives: ["Hedef"], modules: Array.from({ length: 3 }, () => ({ title: "Modül", objective: "Amaç", explanation: "Açıklama", keyPoints: ["Nokta"], checkpoint: { question: "Kontrol", answer: "Yanıt", explanation: "Gerekçe" } })) },
    exam: { title: "Ustalık Sınavı (Mastery Exam)", introduction: "Giriş", questions },
  });
}

describe("parseAndValidateLearningPayload", () => {
  it("en az 30 soru ve dört seçenek taşıyan içeriği kabul eder", () => {
    expect(parseAndValidateLearningPayload(validPayload()).exam.questions).toHaveLength(30);
  });

  it("30 sorudan az içeriği reddeder", () => {
    const payload = JSON.parse(validPayload());
    payload.exam.questions = payload.exam.questions.slice(0, 29);
    expect(() => parseAndValidateLearningPayload(JSON.stringify(payload))).toThrow("en az 30");
  });
});
