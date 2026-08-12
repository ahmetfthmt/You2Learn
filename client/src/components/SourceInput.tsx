import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LearningLevel } from "@shared/learning";
import { FileText, Link2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface SourceInputProps {
  level: LearningLevel;
  onLevelChange: (level: LearningLevel) => void;
  youtubeUrl: string;
  onYoutubeUrlChange: (value: string) => void;
  pdfFile: File | null;
  onPdfFileChange: (file: File | null) => void;
  onGenerate: () => void;
  loading: boolean;
}

const levels: LearningLevel[] = ["Başlangıç", "Orta", "İleri"];

export function SourceInput({ level, onLevelChange, youtubeUrl, onYoutubeUrlChange, pdfFile, onPdfFileChange, onGenerate, loading }: SourceInputProps) {
  const [tab, setTab] = useState<"youtube" | "pdf">("youtube");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectFile = (file?: File) => {
    if (file) onPdfFileChange(file);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.28)] sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Yeni öğrenme alanı</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Kaynağını seç, seviyeni belirle</h2></div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">Türkçe üretim</span>
      </div>
      <div className="space-y-6">
        <div className="grid gap-2"><Label>Hedef öğrenme düzeyi</Label><div className="grid grid-cols-3 gap-2">{levels.map((option) => <button type="button" key={option} onClick={() => onLevelChange(option)} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${level === option ? "border-slate-950 bg-slate-950 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>{option}</button>)}</div></div>
        <Tabs value={tab} onValueChange={(value) => setTab(value as "youtube" | "pdf")}>
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="youtube" className="gap-2 rounded-lg data-[state=active]:bg-white"><Link2 className="size-4" />YouTube URL</TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2 rounded-lg data-[state=active]:bg-white"><FileText className="size-4" />PDF Belgesi</TabsTrigger>
          </TabsList>
          {tab === "youtube" ? <div className="mt-5 grid gap-2"><Label htmlFor="youtube">YouTube video bağlantısı</Label><Input id="youtube" value={youtubeUrl} onChange={(event) => onYoutubeUrlChange(event.target.value)} className="h-12 rounded-xl" placeholder="https://www.youtube.com/watch?v=..." /><p className="text-xs leading-5 text-slate-500">Video için erişilebilir Türkçe altyazı/transkript gerekir. İçerik alınamazsa uygulama üretim yapmaz.</p></div> : <div className="mt-5"><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => selectFile(event.target.files?.[0])} /><button type="button" onClick={() => inputRef.current?.click()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files?.[0]); }} onDragOver={(event) => event.preventDefault()} className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"><UploadCloud className="mb-3 size-7 text-indigo-600" />{pdfFile ? <><span className="max-w-full truncate font-medium text-slate-900">{pdfFile.name}</span><span className="mt-1 text-xs text-slate-500">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB · değiştirmek için tıklayın</span></> : <><span className="font-medium text-slate-900">PDF dosyanızı sürükleyip bırakın</span><span className="mt-1 text-sm text-slate-500">veya bilgisayarınızdan seçin · En fazla 15 MB</span></>}</button>{pdfFile && <button type="button" onClick={() => onPdfFileChange(null)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-rose-600"><X className="size-4" /> Belgeyi kaldır</button>}</div>}
        </Tabs>
        <Button onClick={onGenerate} disabled={loading} className="h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-70">{loading ? "Kaynak analiz ediliyor…" : "Öğrenme uygulaması oluştur"}</Button>
      </div>
    </section>
  );
}
