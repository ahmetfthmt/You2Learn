// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HistoryRecord } from "@shared/learning";

const mocks = vi.hoisted(() => ({
  listHistory: vi.fn(),
  generationCreate: vi.fn(),
  youtubeTranscript: vi.fn(),
  verifyProvider: vi.fn(),
}));

vi.mock("@/lib/history", () => ({
  listHistory: mocks.listHistory,
  saveHistory: vi.fn(),
  removeHistory: vi.fn(),
  clearHistory: vi.fn(),
  openStoredLearning: (record: HistoryRecord) => record.payload,
}));

vi.mock("@/lib/provider", () => ({
  PROVIDERS: { gemini: { label: "Gemini", defaultModel: "gemini-2.5-flash", helper: "Google AI Studio" } },
  getStoredProviderSettings: () => ({ provider: "gemini", model: "gemini-2.5-flash", apiKey: "" }),
  parseAndValidateLearningPayload: vi.fn(),
  clearProviderSettings: vi.fn(),
  saveProviderSettings: vi.fn(),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    source: { youtubeTranscript: { useMutation: () => ({ mutateAsync: mocks.youtubeTranscript, isPending: false }) } },
    generation: {
      create: { useMutation: () => ({ mutateAsync: mocks.generationCreate, isPending: false }) },
      verify: { useMutation: () => ({ mutateAsync: mocks.verifyProvider, isPending: false }) },
    },
  },
}));

vi.mock("@/lib/pdf", () => ({ extractPdfText: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/components/LearningView", () => ({ LearningView: ({ payload }: { payload: HistoryRecord["payload"] }) => React.createElement("div", null, payload.lesson.title) }));

import Home from "./Home";

const record: HistoryRecord = {
  id: "saved-course",
  createdAt: 1,
  source: { kind: "pdf", title: "Geçmiş kaynak" },
  payload: {
    schemaVersion: 1,
    sourceTitle: "Geçmiş kaynak",
    sourceSummary: "Özet",
    sourceBoundaries: "Sınırlar",
    level: "Orta",
    estimatedMinutes: 20,
    lesson: { title: "Kayıtlı ders", subtitle: "", learningObjectives: [], modules: [] },
    exam: { title: "Ustalık Sınavı (Mastery Exam)", introduction: "", questions: [] },
  },
};

describe("Home geçmiş akışı", () => {
  beforeEach(() => {
    mocks.listHistory.mockResolvedValue([record]);
    mocks.generationCreate.mockReset();
  });

  it("geçmiş kaydını yeniden üretim isteği başlatmadan açar", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(await screen.findByRole("button", { name: /geçmiş kaynak öğrenme uygulamasını aç/i }));

    expect(mocks.generationCreate).not.toHaveBeenCalled();
    expect(await screen.findByText("Kayıtlı ders")).toBeTruthy();
  });
});
