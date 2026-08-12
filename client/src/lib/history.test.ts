import { describe, expect, it } from "vitest";
import { openStoredLearning } from "./history";
import type { HistoryRecord } from "@shared/learning";

const record: HistoryRecord = {
  id: "stored-item",
  createdAt: 1,
  source: { kind: "pdf", title: "Kayıtlı kaynak" },
  payload: {
    schemaVersion: 1,
    sourceTitle: "Kayıtlı kaynak",
    sourceSummary: "Özet",
    sourceBoundaries: "Sınırlar",
    level: "Orta",
    estimatedMinutes: 20,
    lesson: { title: "Ders", subtitle: "", learningObjectives: [], modules: [] },
    exam: { title: "Ustalık Sınavı (Mastery Exam)", introduction: "", questions: [] },
  },
};

describe("openStoredLearning", () => {
  it("saklanan ders verisini doğrudan döndürür; yeniden üretim verisine ihtiyaç duymaz", () => {
    expect(openStoredLearning(record)).toBe(record.payload);
  });
});
