import { describe, expect, it } from "vitest";
import { getMasteryBadge, getMasteryPercentage } from "./badges";

describe("ustalık rozetleri", () => {
  it("başarı oranına göre doğru rozet düzeyini verir", () => {
    expect(getMasteryBadge(29, 30).id).toBe("platinum");
    expect(getMasteryBadge(26, 30).id).toBe("gold");
    expect(getMasteryBadge(22, 30).id).toBe("silver");
    expect(getMasteryBadge(16, 30).id).toBe("bronze");
    expect(getMasteryBadge(8, 30).id).toBe("starter");
  });

  it("başarı oranını güvenle yuvarlar", () => {
    expect(getMasteryPercentage(26, 30)).toBe(87);
    expect(getMasteryPercentage(0, 0)).toBe(0);
  });
});
