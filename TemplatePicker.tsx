"use client";
import { Modal } from "./ui";
import { TEMPLATES } from "@/lib/templates";

type Props = { open: boolean; current: number; onClose: () => void; onPick: (id: number) => void };
export default function TemplatePicker({ open, current, onClose, onPick }: Props) {
  return (
    <Modal open={open} onClose={onClose} wide>
      <h2 className="text-xl font-bold">Pilih Template / Choose Template</h2>
      <p className="mb-4 text-sm text-slate-500">20 template invoice gratis - tanpa biaya. / 20 free invoice templates.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => onPick(t.id)} className={`rounded-xl border p-2 text-left text-xs hover:border-toolkiit ${current === t.id ? "border-toolkiit ring-2 ring-toolkiit-light" : ""}`}>
            <div className="mb-2 h-20 rounded border bg-white p-1.5" style={{ borderTop: `8px solid ${t.accent}`, fontFamily: t.font }}>
              <div className="h-2 w-1/2 rounded" style={{ background: t.accent }} />
              <div className="mt-1.5 h-1 w-full bg-slate-200" /><div className="mt-1 h-1 w-4/5 bg-slate-200" /><div className="mt-1 h-1 w-3/5 bg-slate-200" />
            </div>
            <span className="font-medium">{t.id}. {t.name}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
