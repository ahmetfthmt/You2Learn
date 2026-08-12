import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();

const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_SOURCE_CHARS = 120_000;

export async function extractPdfText(file: File) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Yalnızca PDF belgesi yükleyebilirsiniz.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("PDF dosyası en fazla 15 MB olabilir.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data: bytes }).promise;
  const pageCount = document.numPages;
  const pages: string[] = [];
  let wasTruncated = false;

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ").replace(/\s+/g, " ").trim();
    if (text) pages.push(`[Sayfa ${pageNumber}] ${text}`);
    if (pages.join("\n").length > MAX_SOURCE_CHARS) {
      wasTruncated = true;
      break;
    }
  }
  const text = pages.join("\n\n").slice(0, MAX_SOURCE_CHARS);
  if (text.length < 80) throw new Error("PDF içinden yeterli metin çıkarılamadı. Dosya taranmış veya parola korumalı olabilir.");
  return { text, pageCount, wasTruncated };
}
