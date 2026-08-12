import { describe, expect, it } from "vitest";
import { getYouTubeVideoId } from "./source";

describe("getYouTubeVideoId", () => {
  it("standart YouTube URL’sinden video kimliğini çıkarır", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("kısa URL’yi destekler", () => {
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=42")).toBe("dQw4w9WgXcQ");
  });

  it("YouTube olmayan URL’leri reddeder", () => {
    expect(() => getYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toThrow("YouTube");
  });

  it("aşırı uzun URL’leri kaynak isteği başlatmadan reddeder", () => {
    expect(() => getYouTubeVideoId(`https://youtube.com/watch?v=dQw4w9WgXcQ&x=${"a".repeat(2_100)}`)).toThrow("izin verilen uzunluğu");
  });
});
