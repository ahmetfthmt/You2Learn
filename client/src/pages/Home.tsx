import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LearningView } from "@/components/LearningView";
import { LearningPreview } from "@/components/LearningPreview";
import { HistoryListItem } from "@/components/HistoryListItem";
import { ProviderSettings } from "@/components/ProviderSettings";
import { SourceInput } from "@/components/SourceInput";
import { clearHistory, listHistory, openStoredLearning, removeHistory, saveHistory } from "@/lib/history";
import { extractPdfText } from "@/lib/pdf";
import { getStoredProviderSettings, parseAndValidateLearningPayload, PROVIDERS } from "@/lib/provider";
import { trpc } from "@/lib/trpc";
import type { HistoryRecord, LearningLevel, ProviderSettings as ProviderSettingsValue, SourceMaterial } from "@shared/learning";
import { BookOpenText, FileClock, History, Loader2, Settings2, Sparkles, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [settings, setSettings] = useState<ProviderSettingsValue>(() => getStoredProviderSettings());
  const [level, setLevel] = useState<LearningLevel>("Orta");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [active, setActive] = useState<HistoryRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const transcriptMutation = trpc.source.youtubeTranscript.useMutation();
  const generationMutation = trpc.generation.create.useMutation();

  const refreshHistory = async () => {
    try {
      setHistory(await listHistory());
    } catch {
      toast.error("Tarayıcıdaki geçmiş yüklenemedi.");
    }
  };

  useEffect(() => {
    void refreshHistory();
  }, []);

  const buildSource = async (): Promise<SourceMaterial> => {
    if (pdfFile) {
      setStage("PDF metni güvenle çıkarılıyor…");
      const result = await extractPdfText(pdfFile);
      return {
        kind: "pdf",
        title: pdfFile.name.replace(/\.pdf$/i, ""),
        text: result.text,
        pageCount: result.pageCount,
        wasTruncated: result.wasTruncated,
      };
    }
    if (!youtubeUrl.trim()) throw new Error("Bir YouTube video URL’si girin veya PDF belgesi seçin.");
    setStage("Video transkripti doğrulanıyor…");
    return transcriptMutation.mutateAsync({ url: youtubeUrl.trim() });
  };

  const generate = async () => {
    if (!settings.apiKey.trim()) {
      toast.error("Önce Sağlayıcı Ayarları bölümünden kendi API anahtarınızı ekleyin.");
      return;
    }

    try {
      setLoading(true);
      const source = await buildSource();
      setStage(`${PROVIDERS[settings.provider].label} kaynak sınırlarına göre uygulamayı tasarlıyor…`);
      const response = await generationMutation.mutateAsync({ provider: settings.provider, model: settings.model, apiKey: settings.apiKey, source, level });
      const payload = parseAndValidateLearningPayload(response.content);
      const record: HistoryRecord = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        source: {
          kind: source.kind,
          title: source.title,
          url: source.url,
          pageCount: source.pageCount,
          wasTruncated: source.wasTruncated,
        },
        payload,
      };
      await saveHistory(record);
      await refreshHistory();
      setActive(record);
      toast.success("Öğrenme uygulaması oluşturuldu ve geçmişe kaydedildi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Üretim sırasında beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await removeHistory(deleteId);
    if (active?.id === deleteId) setActive(null);
    setDeleteId(null);
    await refreshHistory();
    toast.success("Geçmiş öğesi silindi.");
  };

  const confirmClear = async () => {
    await clearHistory();
    setActive(null);
    setClearDialogOpen(false);
    await refreshHistory();
    toast.success("Tüm geçmiş temizlendi.");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-7">
          <a href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-300"><BookOpenText className="size-5" /></span>
            <span><strong className="block text-sm tracking-tight text-slate-950">All2App</strong><span className="block text-xs text-slate-500">AI Learning Lab</span></span>
          </a>
          <ProviderSettings value={settings} onChange={setSettings} />
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-14 pt-8 sm:px-7 sm:pt-12">
        <section className="mb-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><Sparkles className="size-3.5" /> Kaynağa sadık öğrenme üretimi</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Bir kaynak, özenle tasarlanmış bir öğrenme deneyimi.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">YouTube videosu veya PDF belgesi ekleyin; seçtiğiniz düzeye uyarlanmış ders akışı ve en az 30 soruluk <strong>Ustalık Sınavı (Mastery Exam)</strong> oluşturun.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900"><Settings2 className="size-4 text-indigo-600" /> Gizlilik denetimi sizde</div>
            <p className="mt-1">Seçili sağlayıcı: <strong>{PROVIDERS[settings.provider].label}</strong>. API anahtarınız yalnızca bu tarayıcıda tutulur ve oluşturma talebi doğrudan sağlayıcıya gider.</p>
          </div>
        </section>

        <div className="grid gap-7 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <SourceInput level={level} onLevelChange={setLevel} youtubeUrl={youtubeUrl} onYoutubeUrlChange={setYoutubeUrl} pdfFile={pdfFile} onPdfFileChange={setPdfFile} onGenerate={generate} loading={loading} />
            {loading && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Loader2 className="size-5 animate-spin text-indigo-600" /><div><p className="font-medium text-slate-900">İşlem sürüyor</p><p className="mt-1 text-sm text-slate-500">{stage}</p></div></div><div className="mt-5 space-y-3"><div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" /><div className="h-3 w-full animate-pulse rounded bg-slate-100" /><div className="h-3 w-3/5 animate-pulse rounded bg-slate-100" /></div></section>}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><History className="size-4 text-indigo-600" /><h2 className="font-semibold text-slate-950">Geçmiş</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{history.length}</span></div>{history.length > 0 && <Button variant="ghost" size="sm" onClick={() => setClearDialogOpen(true)} className="h-8 gap-1.5 rounded-lg text-rose-700 hover:bg-rose-50 hover:text-rose-800"><Trash2 className="size-3.5" /> Tümünü temizle</Button>}</div>
              {history.length === 0 ? <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center"><FileClock className="mx-auto size-6 text-slate-400" /><p className="mt-3 text-sm font-medium text-slate-700">Henüz kayıtlı uygulama yok.</p><p className="mt-1 text-xs leading-5 text-slate-500">Oluşturduğunuz içerikler burada saklanır ve yeniden üretim gerektirmeden açılır.</p></div> : <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">{history.map((record) => <HistoryListItem key={record.id} record={record} active={active?.id === record.id} onOpen={(selected) => { openStoredLearning(selected); setActive(selected); }} onDelete={setDeleteId} />)}</div>}
            </section>
          </aside>

          <div className="min-w-0">{active ? <LearningView key={active.id} payload={active.payload} source={active.source} /> : <LearningPreview />}</div>
        </div>
      </main>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Geçmiş öğesi silinsin mi?</AlertDialogTitle><AlertDialogDescription>Bu işlem yalnızca bu tarayıcıdaki kayıtlı öğrenme uygulamasını siler. Kaynak dosya veya video etkilenmez.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Vazgeç</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-rose-700 hover:bg-rose-800">Sil</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Tüm geçmiş temizlensin mi?</AlertDialogTitle><AlertDialogDescription>Bu tarayıcıda saklanan tüm öğrenme uygulamaları silinir. Bu işlem geri alınamaz.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Vazgeç</AlertDialogCancel><AlertDialogAction onClick={confirmClear} className="bg-rose-700 hover:bg-rose-800">Tümünü sil</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
