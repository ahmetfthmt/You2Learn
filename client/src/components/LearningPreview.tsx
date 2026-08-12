import { BookOpenText, FileText, ShieldCheck, Target } from "lucide-react";

export function LearningPreview() {
  return (
    <section className="grid min-h-[530px] place-items-center overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-[radial-gradient(circle_at_25%_20%,rgba(224,231,255,0.7),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(238,242,255,0.9),transparent_32%),rgba(255,255,255,0.7)] p-6 sm:p-10">
      <div className="w-full max-w-2xl text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300"><BookOpenText className="size-6" /></span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">Kaynak → Öğrenme yolu → Ustalık</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Kaynağınız, sınırları korunarak seviyenize uygun bir ders akışına ve ölçülebilir bir sınava dönüşür.</p>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm"><span className="grid size-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><FileText className="size-4" /></span><p className="mt-4 text-sm font-semibold text-slate-950">1. Kaynak</p><p className="mt-1 text-xs leading-5 text-slate-500">Video transkripti veya PDF metni doğrulanır.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm"><span className="grid size-8 place-items-center rounded-xl bg-violet-50 text-violet-600"><ShieldCheck className="size-4" /></span><p className="mt-4 text-sm font-semibold text-slate-950">2. Ders yolu</p><p className="mt-1 text-xs leading-5 text-slate-500">Seviyenize göre yapılandırılmış modüller oluşur.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm"><span className="grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-600"><Target className="size-4" /></span><p className="mt-4 text-sm font-semibold text-slate-950">3. Ustalık</p><p className="mt-1 text-xs leading-5 text-slate-500">En az 30 kaynak temelli soru ile ölçüm yapılır.</p></div>
        </div>
      </div>
    </section>
  );
}
