// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: { share: { getPublic: { useQuery: mocks.query } } },
}));

import App from "./App";

const share = {
  id: 1,
  slug: "public-share-123456",
  shareType: "examResult" as const,
  title: "Uygulama rotası dersi",
  level: "İleri" as const,
  sourceKind: "youtube" as const,
  sourceTitle: "Kaynak video",
  createdAt: new Date(),
  payload: { score: 28, totalQuestions: 30, percentage: 93.33, completedAt: 1, examTitle: "Ustalık Sınavı (Mastery Exam)" as const },
};

describe("paylaşım yönlendirmesi", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    window.history.pushState({}, "", "/paylas/public-share-123456");
    mocks.query.mockReturnValue({ isLoading: false, isError: false, data: share });
  });

  it("/paylas/:slug yolunda genel paylaşım sayfasını render eder", () => {
    render(<App />);
    expect(screen.getByText("28/30 doğru yanıt")).toBeTruthy();
    expect(screen.getByText(/Uygulama rotası dersi/)).toBeTruthy();
  });
});
