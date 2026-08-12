import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const validInput = {
  provider: "gemini" as const,
  model: "gemini-2.5-flash",
  apiKey: "test-key",
  level: "Orta" as const,
  source: { kind: "pdf" as const, title: "Kaynak", text: "x".repeat(80), pageCount: 1 },
};

describe("generation.create input limits", () => {
  const caller = appRouter.createCaller({} as never);

  it("kısa kaynak metnini sağlayıcıya istek göndermeden reddeder", async () => {
    await expect(caller.generation.create({ ...validInput, source: { ...validInput.source, text: "kısa" } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("aşırı uzun model veya API anahtarını reddeder", async () => {
    await expect(caller.generation.create({ ...validInput, model: "m".repeat(161) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.generation.create({ ...validInput, apiKey: "k".repeat(513) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
