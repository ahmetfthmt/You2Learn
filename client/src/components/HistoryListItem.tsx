import type { HistoryRecord } from "@shared/learning";
import { Trash2 } from "lucide-react";
import React from "react";

interface HistoryListItemProps {
  record: HistoryRecord;
  active: boolean;
  onOpen: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
}

export function HistoryListItem({ record, active, onOpen, onDelete }: HistoryListItemProps) {
  return (
    <div className={`group flex items-center gap-2 rounded-xl border p-2 transition ${active ? "border-indigo-300 bg-indigo-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
      <button type="button" aria-label={`${record.source.title} öğrenme uygulamasını aç`} onClick={() => onOpen(record)} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-slate-900">{record.source.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{record.source.kind === "pdf" ? "PDF" : "YouTube"} · {new Date(record.createdAt).toLocaleDateString("tr-TR")}</p>
      </button>
      <button type="button" onClick={() => onDelete(record.id)} aria-label={`${record.source.title} kaydını sil`} className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-100 hover:text-rose-700"><Trash2 className="size-4" /></button>
    </div>
  );
}
