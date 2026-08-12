import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clearProviderSettings, PROVIDERS, saveProviderSettings } from "@/lib/provider";
import { trpc } from "@/lib/trpc";
import type { ProviderSettings as ProviderSettingsValue } from "@shared/learning";
import { Eye, EyeOff, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProviderSettingsProps {
  value: ProviderSettingsValue;
  onChange: (value: ProviderSettingsValue) => void;
}

export function ProviderSettings({ value, onChange }: ProviderSettingsProps) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [verification, setVerification] = useState<"idle" | "valid" | "invalid">("idle");
  const verifyMutation = trpc.generation.verify.useMutation();

  useEffect(() => setDraft(value), [value]);

  const save = () => {
    if (!draft.apiKey.trim()) {
      toast.error("Devam etmek için kendi API anahtarınızı ekleyin.");
      return;
    }
    const next = { ...draft, model: draft.model.trim() || PROVIDERS[draft.provider].defaultModel, apiKey: draft.apiKey.trim() };
    saveProviderSettings(next);
    onChange(next);
    setOpen(false);
    toast.success(`${PROVIDERS[next.provider].label} ayarları bu tarayıcıda saklandı.`);
  };

  const clear = () => {
    clearProviderSettings();
    const next = { provider: "gemini" as const, model: PROVIDERS.gemini.defaultModel, apiKey: "" };
    onChange(next);
    setDraft(next);
    toast.success("Tarayıcıdaki API anahtarı silindi.");
  };

  const verify = async () => {
    if (!draft.apiKey.trim() || !draft.model.trim()) {
      toast.error("Bağlantıyı doğrulamak için model ve API anahtarı girin.");
      return;
    }
    setVerification("idle");
    try {
      await verifyMutation.mutateAsync({ provider: draft.provider, model: draft.model.trim(), apiKey: draft.apiKey.trim() });
      setVerification("valid");
      toast.success(`${PROVIDERS[draft.provider].label} bağlantısı doğrulandı.`);
    } catch (error) {
      setVerification("invalid");
      toast.error(error instanceof Error ? error.message : "Bağlantı doğrulanamadı.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 rounded-xl border-slate-300 bg-white/80 text-slate-700 shadow-sm hover:bg-white">
          <KeyRound className="size-4" /> Sağlayıcı Ayarları
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl border-slate-200 p-0 overflow-hidden">
        <div className="bg-slate-950 px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Kendi API anahtarınla üret</DialogTitle>
            <DialogDescription className="text-slate-300">Anahtar yalnızca bu tarayıcının yerel depolamasında tutulur; sunucuya veya veritabanına kaydedilmez.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-5 px-6 py-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            API anahtarını yalnızca güvendiğiniz kişisel cihazlarda saklayın. Tarayıcı verilerini temizlemek veya aşağıdaki silme işlemi anahtarı kaldırır.
          </div>
          <div className="grid gap-2">
            <Label htmlFor="provider">Yapay zekâ sağlayıcısı</Label>
            <Select value={draft.provider} onValueChange={(provider) => setDraft({ provider: provider as ProviderSettingsValue["provider"], model: PROVIDERS[provider as ProviderSettingsValue["provider"]].defaultModel, apiKey: draft.apiKey })}>
              <SelectTrigger id="provider" className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDERS).map(([id, provider]) => <SelectItem value={id} key={id}>{provider.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">{PROVIDERS[draft.provider].helper}. Model adını sağlayıcınızdaki erişiminize göre değiştirebilirsiniz.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model adı</Label>
            <Input id="model" className="h-11 rounded-xl font-mono text-sm" value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} placeholder={PROVIDERS[draft.provider].defaultModel} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-key">API anahtarı</Label>
            <div className="relative">
              <Input id="api-key" className="h-11 rounded-xl pr-11 font-mono text-sm" type={visible ? "text" : "password"} value={draft.apiKey} onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })} placeholder="Anahtarınızı buraya yapıştırın" autoComplete="off" />
              <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Anahtarı gizle" : "Anahtarı göster"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900">
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" /> Anahtar, üretim anında yalnızca sağlayıcıya iletmek için kullanılır; bu uygulamanın sunucusunda veya veritabanında kaydedilmez.</div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><div><p className="text-sm font-medium text-slate-800">Bağlantıyı doğrula</p><p className="mt-0.5 text-xs text-slate-500">Model erişimi ve anahtar geçerliliği için küçük bir test isteği gönderilir.</p></div><Button type="button" variant="outline" onClick={verify} disabled={verifyMutation.isPending} className="shrink-0 rounded-lg">{verifyMutation.isPending ? "Kontrol ediliyor…" : "Doğrula"}</Button></div>
          {verification === "valid" && <p className="text-sm font-medium text-emerald-700">Bağlantı başarıyla doğrulandı.</p>}
          {verification === "invalid" && <p className="text-sm font-medium text-rose-700">Bağlantı doğrulanamadı. Anahtarın, modelin ve sağlayıcı erişiminin doğru olduğunu kontrol edin.</p>}
        </div>
        <DialogFooter className="flex-row justify-between border-t border-slate-100 px-6 py-4 sm:justify-between">
          <Button variant="ghost" onClick={clear} className="gap-2 text-rose-700 hover:bg-rose-50 hover:text-rose-800"><Trash2 className="size-4" /> Anahtarı sil</Button>
          <Button onClick={save} className="rounded-xl bg-slate-950 px-5 hover:bg-slate-800">Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
