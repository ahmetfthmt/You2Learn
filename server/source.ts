import { fetchTranscript } from "youtube-transcript";

export const MAX_SOURCE_CHARS = 120_000;
export const MAX_YOUTUBE_URL_LENGTH = 2_048;

export function getYouTubeVideoId(rawUrl: string) {
  if (rawUrl.length > MAX_YOUTUBE_URL_LENGTH) throw new Error("YouTube URL’si izin verilen uzunluğu aşıyor.");
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Geçerli bir YouTube video URL’si girin.");
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  let videoId = "";
  if (host === "youtu.be") videoId = url.pathname.split("/").filter(Boolean)[0] || "";
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    videoId = url.searchParams.get("v") || "";
    if (!videoId && url.pathname.startsWith("/shorts/")) videoId = url.pathname.split("/")[2] || "";
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error("URL bir YouTube videosunu tanımlamıyor.");
  return videoId;
}

export async function getYouTubeSource(rawUrl: string) {
  const videoId = getYouTubeVideoId(rawUrl);
  let title = `YouTube videosu (${videoId})`;
  try {
    const infoResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`);
    if (infoResponse.ok) {
      const info = await infoResponse.json() as { title?: string };
      title = info.title?.trim() || title;
    }
  } catch {
    // Transkript erişilebiliyorsa başlık hatası üretimi engellemez.
  }

  try {
    const captions = await fetchTranscript(videoId, { lang: "tr" });
    const combined = captions.map((caption) => caption.text).join(" ").replace(/\s+/g, " ").trim();
    if (combined.length < 120) throw new Error("Türkçe transkript yeterli uzunlukta değil.");
    return {
      kind: "youtube" as const,
      title,
      text: combined.slice(0, MAX_SOURCE_CHARS),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      wasTruncated: combined.length > MAX_SOURCE_CHARS,
    };
  } catch {
    throw new Error("Bu video için erişilebilir Türkçe transkript alınamadı. Lütfen altyazısı açık başka bir video kullanın veya aynı materyali PDF olarak yükleyin.");
  }
}
