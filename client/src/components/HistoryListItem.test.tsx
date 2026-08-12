// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryListItem } from "./HistoryListItem";
import type { HistoryRecord } from "@shared/learning";

const record: HistoryRecord = {
  id: "history-1",
  createdAt: 1,
  source: { kind: "pdf", title: "Yerel kaynak" },
  payload: {
    schemaVersion: 1,
    sourceTitle: "Yerel kaynak",
    sourceSummary: "Özet",
    sourceBoundaries: "Sınırlar",
    level: "Orta",
    estimatedMinutes: 20,
    lesson: { title: "Ders", subtitle: "", learningObjectives: [], modules: [] },
    exam: { title: "Ustalık Sınavı (Mastery Exam)", introduction: "", questions: [] },
  },
};

describe("HistoryListItem", () => {
  it("kayıt seçildiğinde yalnızca yerel açma eylemini yürütür, üretim isteği başlatmaz", async () => {
    const user = userEvent.setup();
    const open = vi.fn();
    const remove = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<HistoryListItem record={record} active={false} onOpen={open} onDelete={remove} />);

    await user.click(screen.getByRole("button", { name: /yerel kaynak öğrenme uygulamasını aç/i }));

    expect(open).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(record);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
