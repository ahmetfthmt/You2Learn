// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn().mockResolvedValue({ slug: "certificate-share-456" }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { share: { create: { useMutation: () => ({ mutateAsync: mocks.mutateAsync, isPending: false, data: undefined }) } } } }));

import { CertificateDialog } from "./CertificateDialog";

const payload = {
  level: "Orta",
  lesson: { title: "İstatistik Temelleri" },
  exam: { questions: Array.from({ length: 30 }, (_, id) => ({ id })) },
} as any;

describe("sertifika oluşturma diyaloğu", () => {
  it("yalnızca başarı özeti için sınav sonucu paylaşımı oluşturur", async () => {
    render(<CertificateDialog source={{ kind: "pdf", title: "Ders notları" }} payload={payload} result={{ score: 26, totalQuestions: 30, completedAt: 1_726_000_000_000 }} badge={{ id: "gold", name: "Altın Ustalık Rozeti", shortLabel: "Altın", minPercentage: 85, description: "Açıklama", celebration: "Kutlama", accentClass: "from-amber-500 to-orange-500" }} />);
    fireEvent.click(screen.getByRole("button", { name: /sertifikanı görüntüle/i }));
    fireEvent.click(screen.getByRole("button", { name: /sertifikayı oluştur/i }));

    await vi.waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ shareType: "examResult", courseTitle: "İstatistik Temelleri", payload: expect.objectContaining({ score: 26, totalQuestions: 30, percentage: 87 }) })));
  });
});
