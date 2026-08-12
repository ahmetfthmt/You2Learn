import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSharedLearningItem: vi.fn(),
  getSharedLearningItemBySlug: vi.fn(),
}));

vi.mock("./db", () => ({
  createSharedLearningItem: mocks.createSharedLearningItem,
  getSharedLearningItemBySlug: mocks.getSharedLearningItemBySlug,
}));

import { createPublicShare, createShareInputSchema, getPublicShare } from "./share";

function materialInput() {
  return {
    shareType: "material" as const,
    source: { kind: "pdf" as const, title: "Güvenli kaynak", text: "HAM KAYNAK METNİ PAYLAŞILMAMALIDIR" },
    payload: {
      schemaVersion: 1 as const,
      sourceTitle: "Güvenli kaynak",
      sourceSummary: "Kaynağa bağlı özet",
      sourceBoundaries: "Yalnızca kaynakta bulunan bilgiler kullanılmıştır.",
      level: "Orta" as const,
      estimatedMinutes: 18,
      lesson: {
        title: "Paylaşılan ders",
        subtitle: "Ders alt başlığı",
        learningObjectives: ["Birinci hedef"],
        modules: [{ title: "Modül", objective: "Amaç", explanation: "Açıklama", keyPoints: ["Ana nokta"], checkpoint: { question: "Soru", answer: "Yanıt", explanation: "Neden" } }],
      },
      exam: {
        title: "Ustalık Sınavı (Mastery Exam)" as const,
        introduction: "Sınav açıklaması",
        questions: Array.from({ length: 30 }, (_, index) => ({ id: index + 1, question: `Soru ${index + 1}`, options: ["A", "B"], correctIndex: 0, explanation: "Açıklama", competency: "Yetkinlik" })),
      },
    },
  };
}

describe("paylaşım sözleşmesi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ham kaynak metnini paylaşım girdisinden dışarıda bırakır", () => {
    const parsed = createShareInputSchema.parse(materialInput());
    expect(parsed.source).toEqual({ kind: "pdf", title: "Güvenli kaynak" });
    expect(parsed.source).not.toHaveProperty("text");
  });

  it("materyal için benzersiz paylaşım kaydı oluşturur", async () => {
    mocks.createSharedLearningItem.mockImplementation(async (item) => ({ id: 1, ...item, createdAt: new Date() }));

    const created = await createPublicShare(createShareInputSchema.parse(materialInput()));

    expect(mocks.createSharedLearningItem).toHaveBeenCalledTimes(1);
    expect(mocks.createSharedLearningItem.mock.calls[0][0]).toMatchObject({ shareType: "material", title: "Paylaşılan ders", level: "Orta", sourceKind: "pdf" });
    expect(mocks.createSharedLearningItem.mock.calls[0][0].slug).toMatch(/^[A-Za-z0-9_-]{20}$/);
    expect(created).toMatchObject({ id: 1, shareType: "material" });
  });

  it("genel bağlantı sorgusunu kayıt katmanına iletir", async () => {
    mocks.getSharedLearningItemBySlug.mockResolvedValue({ id: 4, slug: "public-share-123456" });
    await expect(getPublicShare("public-share-123456")).resolves.toMatchObject({ id: 4 });
    expect(mocks.getSharedLearningItemBySlug).toHaveBeenCalledWith("public-share-123456");
  });
});
