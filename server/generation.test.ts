import { describe, expect, it } from "vitest";
import { createGenerationPrompt } from "./generation";

describe("createGenerationPrompt", () => {
  it("kaynak sadakati ve 30 soru koşulunu zorunlu olarak içerir", () => {
    const prompt = createGenerationPrompt({ kind: "pdf", title: "Test PDF", text: "Kaynak metni", pageCount: 1 }, "Orta");
    expect(prompt).toContain("KAYNAK SADAKATİ ZORUNLUDUR");
    expect(prompt).toContain("En az 30 soru üret");
    expect(prompt).toContain("Kaynak metni");
  });
});
