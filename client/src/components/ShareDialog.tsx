import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import type { LearningPayload, SourceMaterial } from "@shared/learning";
import { Check, Copy, ExternalLink, Link2, Linkedin, Loader2, Send, Share2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type SharedSource = Omit<SourceMaterial, "text">;

type ShareDialogProps = {
  variant: "material" | "examResult";
  source: SharedSource;
  payload: LearningPayload;
  result?: { score: number; totalQuestions: number; completedAt: number };
};

export function buildShareText(variant: ShareDialogProps["variant"], payload: LearningPayload, result?: ShareDialogProps["result"]) {
  if (variant === "material") return `“${payload.lesson.title}” öğrenme materyalini All2App AI Learning Lab ile incele.`;
  const percentage = result ? Math.round((result.score / result.totalQuestions) * 100) : 0;
  return `All2App AI Learning Lab Ustalık Sınavı sonucum: ${result?.score}/${result?.totalQuestions} (%${percentage}).`;
}

export function buildSocialShareLinks(shareUrl: string, shareText: string) {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
  return Promise.resolve();
}

export function ShareDialog({ variant, source, payload, result }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const createShare = trpc.share.create.useMutation();
  const share = createShare.data;
  const isMaterial = variant === "material";
  const title = isMaterial ? "Öğrenme materyalini paylaş" : "Sınav sonucunu paylaş";
  const shareText = useMemo(() => buildShareText(variant, payload, result), [payload, result, variant]);
  const shareUrl = share && typeof window !== "undefined" ? `${window.location.origin}/paylas/${share.slug}` : "";
  const socialLinks = buildSocialShareLinks(shareUrl, shareText);

  const createLink = async () => {
    try {
      if (isMaterial) {
        await createShare.mutateAsync({ shareType: "material", source: { kind: source.kind, title: source.title }, payload });
      } else if (result) {
        await createShare.mutateAsync({
          shareType: "examResult",
          source: { kind: source.kind, title: source.title },
          level: payload.level,
          courseTitle: payload.lesson.title,
          payload: {
            score: result.score,
            totalQuestions: result.totalQuestions,
            percentage: Math.round((result.score / result.totalQuestions) * 100),
            completedAt: result.completedAt,
            examTitle: "Ustalık Sınavı (Mastery Exam)",
          },
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Paylaşım bağlantısı oluşturulamadı.");
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await copyText(shareUrl);
    setCopied(true);
    toast.success("Paylaşım bağlantısı kopyalandı.");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const openSystemShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: payload.lesson.title, text: shareText, url: shareUrl });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    } else {
      await copyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl border-slate-300 bg-white shadow-sm"><Share2 className="size-4" />{isMaterial ? "Materyali paylaş" : "Sonucu paylaş"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
        <div className="bg-slate-950 px-6 py-7 text-white sm:px-8"><div className="flex size-11 items-center justify-center rounded-2xl bg-white/10"><Share2 className="size-5" /></div><DialogHeader className="mt-5"><DialogTitle className="text-xl text-white">{title}</DialogTitle><DialogDescription className="text-sm leading-6 text-slate-300">Paylaşmak için önce güvenli bir bağlantı oluşturun. Bu bağlantı, orijinal PDF veya video transkriptini içermez.</DialogDescription></DialogHeader></div>
        <div className="space-y-5 p-6 sm:p-8">
          {!share ? <><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Paylaşım kapsamı:</strong> {isMaterial ? "Ders akışı ve Ustalık Sınavı paylaşılır; kaynak dosyanın veya video transkriptinin ham metni paylaşılmaz." : "Yalnızca ders adı, düzey, puan ve tamamlanma özeti paylaşılır; yanıtlarınız paylaşılmaz."}</div><Button onClick={createLink} disabled={createShare.isPending} className="h-11 w-full gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700">{createShare.isPending ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />} Bağlantıyı oluştur ve paylaş</Button></> : <><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><strong>Bağlantınız hazır.</strong><br />Dilediğiniz yerde paylaşabilirsiniz.</div><div className="flex gap-2"><input value={shareUrl} readOnly aria-label="Paylaşım bağlantısı" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none" /><Button onClick={copyLink} variant="outline" className="shrink-0 gap-2 rounded-xl">{copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}{copied ? "Kopyalandı" : "Kopyala"}</Button></div><div className="grid gap-2 sm:grid-cols-3"><Button onClick={openSystemShare} className="gap-2 rounded-xl bg-slate-950 hover:bg-slate-800"><Send className="size-4" />Paylaş</Button><a href={socialLinks.x} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"><ExternalLink className="size-4" />X</a><a href={socialLinks.linkedIn} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"><Linkedin className="size-4" />LinkedIn</a></div></>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
