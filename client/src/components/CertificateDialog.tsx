import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getMasteryPercentage, type MasteryBadge } from "@/lib/badges";
import { trpc } from "@/lib/trpc";
import type { LearningPayload, SourceMaterial } from "@shared/learning";
import { Check, Copy, Download, Loader2, Send, ShieldCheck, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CertificateDialogProps = {
  source: Omit<SourceMaterial, "text">;
  payload: LearningPayload;
  result: { score: number; totalQuestions: number; completedAt: number };
  badge: MasteryBadge;
};

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export function CertificateDialog({ source, payload, result, badge }: CertificateDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const createShare = trpc.share.create.useMutation();
  const certificateUrl = createShare.data && typeof window !== "undefined" ? `${window.location.origin}/sertifika/${createShare.data.slug}` : "";
  const percentage = getMasteryPercentage(result.score, result.totalQuestions);

  const createCertificate = async () => {
    try {
      await createShare.mutateAsync({
        shareType: "examResult",
        source: { kind: source.kind, title: source.title },
        level: payload.level,
        courseTitle: payload.lesson.title,
        payload: { score: result.score, totalQuestions: result.totalQuestions, percentage, completedAt: result.completedAt, examTitle: "Ustalık Sınavı (Mastery Exam)" },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sertifika bağlantısı oluşturulamadı.");
    }
  };

  const copyLink = async () => {
    if (!certificateUrl) return;
    await copyText(certificateUrl);
    setCopied(true);
    toast.success("Sertifika bağlantısı kopyalandı.");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const systemShare = async () => {
    if (!certificateUrl) return;
    const text = `${payload.lesson.title} için ${badge.name} kazandım: %${percentage}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "All2App başarı sertifikası", text, url: certificateUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="gap-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100"><Trophy className="size-4 text-amber-500" /> Sertifikanı görüntüle</Button></DialogTrigger><DialogContent className="max-w-lg overflow-hidden rounded-3xl p-0"><div className={`bg-gradient-to-br ${badge.accentClass} px-6 py-7 text-white sm:px-8`}><span className="grid size-12 place-items-center rounded-2xl bg-white/15 text-amber-100"><Trophy className="size-6" /></span><DialogHeader className="mt-5"><DialogTitle className="text-xl text-white">Başarı sertifikanız</DialogTitle><DialogDescription className="text-sm leading-6 text-white/80">{badge.name} ile tamamladığınız başarıyı özenle hazırlanmış sertifika sayfasında kutlayın.</DialogDescription></DialogHeader></div><div className="space-y-5 p-6 sm:p-8">{!createShare.data ? <><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"><strong className="text-slate-950">Sertifikada yer alacak bilgiler:</strong><br />Ders adı, seviye, puan, başarı oranı, rozet ve tamamlanma tarihi. Sınav yanıtlarınız ile kaynak ham metni eklenmez.</div><Button onClick={createCertificate} disabled={createShare.isPending} className="h-11 w-full gap-2 rounded-xl bg-slate-950 hover:bg-slate-800">{createShare.isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Sertifikayı oluştur</Button></> : <><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><strong>Sertifikanız hazır.</strong><br />Bağlantıyı açarak görüntüleyebilir veya paylaşabilirsiniz.</div><a href={certificateUrl} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-medium text-white transition hover:bg-slate-800"><Trophy className="size-4 text-amber-300" /> Sertifikayı aç</a><div className="flex gap-2"><input aria-label="Sertifika bağlantısı" value={certificateUrl} readOnly className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none" /><Button onClick={copyLink} variant="outline" className="shrink-0 gap-2 rounded-xl">{copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}{copied ? "Kopyalandı" : "Kopyala"}</Button></div><Button onClick={systemShare} variant="outline" className="w-full gap-2 rounded-xl"><Send className="size-4" /> Sistem paylaşımını aç</Button><p className="flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" /> Sertifika genel bağlantısında yalnızca başarı özeti yer alır.</p></>}</div></DialogContent></Dialog>;
}
