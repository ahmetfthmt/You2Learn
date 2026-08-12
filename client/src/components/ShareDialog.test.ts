import { describe, expect, it } from "vitest";
import type { LearningPayload } from "@shared/learning";
import { buildShareText, buildSocialShareLinks } from "./ShareDialog";

const payload: LearningPayload = {
  schemaVersion: 1,
  sourceTitle: "Kaynak",
  sourceSummary: "Özet",
  sourceBoundaries: "Sınır",
  level: "Orta",
  estimatedMinutes: 15,
  lesson: { title: "Kuantum temelleri", subtitle: "", learningObjectives: [], modules: [] },
  exam: { title: "Ustalık Sınavı (Mastery Exam)", introduction: "", questions: [] },
};

describe("paylaşım metni ve sosyal bağlantılar", () => {
  it("materyal paylaşım metnini ders adıyla oluşturur", () => {
    expect(buildShareText("material", payload)).toBe("“Kuantum temelleri” öğrenme materyalini All2App AI Learning Lab ile incele.");
  });

  it("sınav sonucu metnini yuvarlanmış puanla oluşturur", () => {
    expect(buildShareText("examResult", payload, { score: 26, totalQuestions: 30, completedAt: 1 })).toContain("26/30 (%87)");
  });

  it("X ve LinkedIn bağlantılarında hem metni hem genel paylaşım URL’sini kodlar", () => {
    const shareUrl = "https://example.com/paylas/secure-slug-123";
    const links = buildSocialShareLinks(shareUrl, "Ders özeti & başarı");
    expect(decodeURIComponent(links.x)).toContain(`url=${shareUrl}`);
    expect(decodeURIComponent(links.x)).toContain("Ders özeti & başarı");
    expect(decodeURIComponent(links.linkedIn)).toContain(`url=${shareUrl}`);
  });
});
