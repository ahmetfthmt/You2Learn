// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: { share: { getPublic: { useQuery: mocks.query } } },
}));

vi.mock("wouter", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
  useRoute: () => [true, { slug: "public-share-123456" }],
}));

import SharedLearning from "./SharedLearning";

const materialShare = {
  id: 1,
  slug: "public-share-123456",
  shareType: "material" as const,
  title: "Paylaşılan ders",
  level: "Orta" as const,
  sourceKind: "pdf" as const,
  sourceTitle: "Güvenli kaynak",
  createdAt: new Date(),
  payload: {
    schemaVersion: 1 as const,
    sourceTitle: "Güvenli kaynak",
    sourceSummary: "Kaynak özeti",
    sourceBoundaries: "Kaynak sınırı",
    level: "Orta" as const,
    estimatedMinutes: 12,
    lesson: { title: "Paylaşılan ders", subtitle: "Ders alt başlığı", learningObjectives: ["Birinci hedef"], modules: [{ title: "Birinci modül", objective: "Amaç", explanation: "Modül açıklaması", keyPoints: ["Ana nokta"], checkpoint: { question: "Soru", answer: "Yanıt", explanation: "Neden" } }] },
    exam: { title: "Ustalık Sınavı (Mastery Exam)" as const, introduction: "Sınav", questions: [] },
    rawSourceText: "HAM KAYNAK METNİ PAYLAŞILMAMALIDIR",
  },
};

describe("genel paylaşım sayfası", () => {
  beforeEach(() => vi.clearAllMocks());

  it("materyali gösterir fakat ham kaynak metnini göstermez", () => {
    mocks.query.mockReturnValue({ isLoading: false, isError: false, data: materialShare });
    render(<SharedLearning />);

    expect(screen.getByText("Paylaşılan ders")).toBeTruthy();
    expect(screen.getByText("Birinci modül")).toBeTruthy();
    expect(screen.queryByText("HAM KAYNAK METNİ PAYLAŞILMAMALIDIR")).toBeNull();
  });

  it("sınav sonucunu puan özetiyle gösterir", () => {
    mocks.query.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { ...materialShare, shareType: "examResult", payload: { score: 26, totalQuestions: 30, percentage: 86.67, completedAt: 1, examTitle: "Ustalık Sınavı (Mastery Exam)" as const } },
    });
    render(<SharedLearning />);

    expect(screen.getByText("26/30 doğru yanıt")).toBeTruthy();
    expect(screen.getByText("%87")).toBeTruthy();
  });
});
