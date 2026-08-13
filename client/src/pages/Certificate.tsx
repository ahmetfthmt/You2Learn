import { Button } from "@/components/ui/button";
import { getMasteryBadge, getMasteryPercentage } from "@/lib/badges";
import { trpc } from "@/lib/trpc";
import { Award, CheckCircle2, ChevronLeft, Copy, Download, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";

type ExamResult = { score: number; totalQuestions: number; percentage: number; completedAt: number; examTitle: "Ustalık Sınavı (Mastery Exam)" };

function CertificateShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f6f7fb] text-slate-950"><header className="border-b border-slate-200 bg-white/85 backdrop-blur"><div className="container flex h-[73px] items-center justify-between"><Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-white"><Award className="size-5" /></span><span><strong className="block text-sm">All2App</strong><span className="block text-xs text-slate-500">AI Learning Lab</span></span></Link><span className="hidden text-xs font-medium text-slate-500 sm:block">Başarı sertifikası</span></div></header>{children}</div>;
}

function CertificateUnavailable() {
  return <CertificateShell><main className="container grid min-h-[calc(100vh-73px)] place-items-center py-12"><section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><Award className="size-6" /></span><h1 className="mt-5 text-2xl font-semibold tracking-tight">Sertifika bulunamadı</h1><p className="mt-3 text-sm leading-6 text-slate-600">Bu bağlantı geçersiz olabilir veya sertifika artık erişilebilir değildir.</p><Button asChild className="mt-6 rounded-xl bg-slate-950 hover:bg-slate-800"><a href="/"><ChevronLeft className="mr-1 size-4" /> Ana sayfaya dön</a></Button></section></main></CertificateShell>;
}

export default function Certificate() {
  const [, params] = useRoute("/sertifika/:slug");
  const slug = params?.slug ?? "";
  const certificate = trpc.share.getPublic.useQuery({ slug }, { enabled: Boolean(slug), retry: false });
  const [copied, setCopied] = useState(false);
  if (certificate.isLoading) return <CertificateShell><main className="container py-16"><div className="mx-auto h-[590px] max-w-4xl animate-pulse rounded-[2rem] bg-slate-200" /></main></CertificateShell>;
  if (certificate.isError || !certificate.data || certificate.data.shareType !== "examResult") return <CertificateUnavailable />;

  const item = certificate.data;
  const result = item.payload as ExamResult;
  const percentage = getMasteryPercentage(result.score, result.totalQuestions);
  const badge = getMasteryBadge(result.score, result.totalQuestions);
  const date = new Date(result.completedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const url = typeof window === "undefined" ? "" : window.location.href;
  const copyLink = async () => { await navigator.clipboard?.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const share = async () => { const text = `${item.title} için ${badge.name} kazandım: %${percentage}.`; if (navigator.share) { await navigator.share({ title: "All2App başarı sertifikası", text, url }); } else await copyLink(); };

  return <CertificateShell><main className="container py-8 sm:py-14"><div className="mx-auto max-w-4xl"><section className="relative overflow-hidden rounded-[2rem] border border-amber-200 bg-white px-5 py-8 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] sm:px-12 sm:py-14"><div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#b7791f 1px, transparent 1px)", backgroundSize: "14px 14px" }} /><div className="relative text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-950 text-amber-300 shadow-lg shadow-slate-950/20"><Trophy className="size-7" /></span><p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Başarı Sertifikası</p><h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Ustalık yolculuğu</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600">Bu belge, aşağıdaki öğrenme alanında Ustalık Sınavı (Mastery Exam) tamamlanarak başarıyla ilerleme kaydedildiğini doğrular.</p><div className={`mx-auto mt-8 max-w-md rounded-3xl bg-gradient-to-br ${badge.accentClass} p-[1px] shadow-lg`}><div className="rounded-[23px] bg-white px-5 py-6"><Sparkles className="mx-auto size-5 text-amber-500" /><p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Kazanılan rozet</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">{badge.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{badge.description}</p></div></div><h3 className="mt-9 text-2xl font-semibold text-slate-950 sm:text-3xl">{item.title}</h3><p className="mt-2 text-sm text-slate-600">{item.level} düzeyi · {date}</p><div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Başarı</span><strong className="mt-1 block font-mono text-2xl text-slate-950">%{percentage}</strong></div><div className="rounded-2xl bg-slate-50 p-4"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Doğru yanıt</span><strong className="mt-1 block font-mono text-2xl text-slate-950">{result.score}/{result.totalQuestions}</strong></div><div className="rounded-2xl bg-slate-50 p-4"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Kaynak</span><strong className="mt-1 block truncate text-sm text-slate-950">{item.sourceTitle}</strong></div></div><div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-xs leading-5 text-emerald-950"><CheckCircle2 className="size-4 shrink-0 text-emerald-600" />Sertifika yalnızca başarı özetini içerir; sınav yanıtları ve kaynak metni paylaşılmaz.</div></div></section><div className="mt-5 flex flex-wrap justify-center gap-3"><Button onClick={copyLink} variant="outline" className="gap-2 rounded-xl bg-white"><Copy className="size-4" />{copied ? "Bağlantı kopyalandı" : "Bağlantıyı kopyala"}</Button><Button onClick={share} className="gap-2 rounded-xl bg-slate-950 hover:bg-slate-800"><Download className="size-4" /> Sertifikayı paylaş</Button></div><p className="mt-6 flex justify-center gap-2 text-center text-xs text-slate-500"><ShieldCheck className="size-3.5 text-emerald-600" /> Sertifika kimliği: {item.slug}</p></div></main></CertificateShell>;
}
