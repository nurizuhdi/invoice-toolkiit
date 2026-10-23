"use client";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";

const toDataUrl = (b: Blob) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(b); });

export async function removeBg(file: File): Promise<string> {
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await removeBackground(file);
  return toDataUrl(blob);
}

type Props = { value: string; onChange: (v: string) => void; label: string; autoRemoveBg?: boolean; maxMB?: number; className?: string };
export default function ImageUpload({ value, onChange, label, autoRemoveBg = true, maxMB = 5, className = "" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(f?: File) {
    if (!f) return;
    setErr("");
    if (f.size > maxMB * 1024 * 1024) return setErr(`Max ${maxMB}MB`);
    setBusy(true);
    try { onChange(autoRemoveBg ? await removeBg(f) : await toDataUrl(f)); }
    catch { setErr("Gagal memproses gambar / Failed to process image"); onChange(await toDataUrl(f)); }
    setBusy(false);
  }
  return (
    <div className={className}>
      <div onClick={() => ref.current?.click()} className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 p-3 text-center text-sm text-slate-500 hover:border-toolkiit">
        {busy ? <span className="animate-pulse">Menghapus background... / Removing background...</span>
          : value ? <img src={value} alt="preview" className="max-h-24 object-contain" style={{ backgroundImage: "conic-gradient(#eee 25%,#fff 0 50%,#eee 0 75%,#fff 0)", backgroundSize: "12px 12px" }} />
          : (<><Upload className="h-5 w-5" /><span>{label}</span></>)}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => pick(e.target.files?.[0])} />
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
