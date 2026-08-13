// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/trpc", () => ({ trpc: { share: { getPublic: { useQuery: mocks.query } } } }));
vi.mock("wouter", () => ({ Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>, useRoute: () => [true, { slug: "certificate-share-123" }] }));

import Certificate from "./Certificate";

const certificateShare = {
  id: 7,
  slug: "certificate-share-123",
  shareType: "examResult" as const,
  title: "Algoritma Temelleri",
  level: "İleri" as const,
  sourceKind: "pdf" as const,
  sourceTitle: "Güvenli kaynak başlığı",
  createdAt: new Date(),
  payload: { score: 29, totalQuestions: 30, percentage: 96.67, completedAt: 1_726_000_000_000, examTitle: "Ustalık Sınavı (Mastery Exam)" as const, rawSourceText: "BU METİN SERTİFİKADA GÖRÜNMEMELİ" },
};

describe("başarı sertifikası sayfası", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rozet, başarı özeti ve tamamlanma bilgisini gösterir; ham kaynak metnini göstermez", () => {
    mocks.query.mockReturnValue({ isLoading: false, isError: false, data: certificateShare });
    render(<Certificate />);

    expect(screen.getByText("Başarı Sertifikası")).toBeTruthy();
    expect(screen.getByText("Platin Ustalık Rozeti")).toBeTruthy();
    expect(screen.getByText("Algoritma Temelleri")).toBeTruthy();
    expect(screen.getByText("29/30")).toBeTruthy();
    expect(screen.queryByText("BU METİN SERTİFİKADA GÖRÜNMEMELİ")).toBeNull();
  });
});
