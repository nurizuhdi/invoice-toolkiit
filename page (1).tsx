"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Invoice, Item, newInvoice, uid, subtotal, grandTotal } from "@/lib/types";
import { terbilang } from "@/lib/terbilang";
import { generateZip } from "@/lib/pdf";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import ImageUpload from "@/components/ImageUpload";
import SignaturePadBox from "@/components/SignaturePadBox";
import InvoicePaper from "@/components/InvoicePaper";
import AdGateModal from "@/components/AdGateModal";
import TemplatePicker from "@/components/TemplatePicker";
import { TEMPLATES } from "@/lib/templates";

const MAX = 10;

export default function CreatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [active, setActive] = useState(0);
  const [pend, setPend] = useState<Record<string, { sig: string; stamp: string }>>({});
  const [ad, setAd] = useState<null | "download" | "add">(null);
  const [tplMode, setTplMode] = useState<null | "add" | "change">(null);
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);
  const previewWrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return router.replace("/");
      setInvoices([newInvoice(0)]); setReady(true);
    });
  }, [router]);

  useEffect(() => {
    const fit = () => previewWrap.current && setScale(Math.min(1, previewWrap.current.offsetWidth / 794));
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, [ready]);

  const inv = invoices[active];
  const pd = inv ? pend[inv.id] : undefined;
  const sig = pd?.sig ?? inv?.signature ?? "";
  const stamp = pd?.stamp ?? inv?.stamp ?? "";
  const setPending = (patch: Partial<{ sig: string; stamp: string }>) =>
    setPend((p) => ({ ...p, [inv.id]: { sig: inv.signature, stamp: inv.stamp, ...p[inv.id], ...patch } }));
  const upd = (patch: Partial<Invoice>) => setInvoices((l) => l.map((x, i) => (i === active ? { ...x, ...patch } : x)));
  const updCompany = (patch: Partial<Invoice>) => {
    upd(patch);
    const next = { ...inv, ...patch };
    localStorage.setItem("tk_company", JSON.stringify({ companyName: next.companyName, wa: next.wa, address: next.address, npwp: next.npwp, bankName: next.bankName, bankNo: next.bankNo, bankHolder: next.bankHolder }));
  };
  const updItem = (id: string, patch: Partial<Item>) => upd({ items: inv.items.map((x) => (x.id === id ? { ...x, ...patch } : x)) });

  const addInvoice = () => { if (invoices.length >= MAX) return; setAd("add"); };
  const removeInvoice = (i: number) => {
    if (invoices.length === 1) return;
    setInvoices((l) => l.filter((_, k) => k !== i)); setActive(Math.max(0, i === active ? 0 : active > i ? active - 1 : active));
  };
  const apply = () => { upd({ signature: sig, stamp }); setApplied(true); setTimeout(() => setApplied(false), 1500); };

  async function doDownload() {
    setBusy(true);
    try {
      await generateZip(invoices);
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      if (u) await supabase.from("invoices").insert(invoices.map((x) => ({
        user_id: u.id, invoice_number: x.number, company_name: x.companyName, client_name: x.clientName, total: grandTotal(x), data_json: x, status: "draft",
      })));
    } catch (e) { console.error(e); alert("Gagal generate PDF / Failed to generate PDF"); }
    setBusy(false);
  }
  const onDownload = () => setAd("download");
  const onRewarded = () => { const k = ad; setAd(null); if (k === "download") doDownload(); else if (k === "add") setTplMode("add"); };
  const pickTemplate = (t: number) => {
    if (tplMode === "add") { setInvoices((l) => [...l, newInvoice(l.length, inv, t)]); setActive(invoices.length); }
    else upd({ template: t });
    setTplMode(null);
  };

  if (!ready || !inv) return <main className="p-10 text-center text-slate-500">Loading...</main>;

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <span className="text-2xl font-extrabold text-toolkiit">Toolkiit</span>
        <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}>Logout</Button>
      </header>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {invoices.map((x, i) => (
          <button key={x.id} onClick={() => setActive(i)} className={`rounded-lg px-3 py-1.5 text-sm ${i === active ? "bg-toolkiit text-white" : "bg-white border"}`}>Draft {i + 1}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatePresence mode="wait" initial={false}>
        <motion.div key={inv.id} className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <Card title="Company Identity / Identitas Usaha">
            <div className="space-y-3">
              <ImageUpload value={inv.logo} onChange={(v) => upd({ logo: v })} label="Upload Logo (PNG/JPG)" />
              <p className="text-xs text-green-600">Auto remove background aktif</p>
              <Field label="Nama Usaha"><Input placeholder="CV Toolkiit Mandiri" value={inv.companyName} onChange={(e) => updCompany({ companyName: e.target.value })} /></Field>
              <Field label="No WA"><Input value={inv.wa} onChange={(e) => updCompany({ wa: e.target.value })} /></Field>
              <Field label="Alamat Lengkap"><Textarea rows={2} value={inv.address} onChange={(e) => updCompany({ address: e.target.value })} /></Field>
              <Field label="NPWP (opsional)"><Input value={inv.npwp} onChange={(e) => updCompany({ npwp: e.target.value })} /></Field>
              <h3 className="pt-2 text-sm font-semibold">Info Pembayaran / Payment Info</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Nama Bank"><Input value={inv.bankName} onChange={(e) => updCompany({ bankName: e.target.value })} /></Field>
                <Field label="No Rekening"><Input value={inv.bankNo} onChange={(e) => updCompany({ bankNo: e.target.value })} /></Field>
                <Field label="Atas Nama"><Input value={inv.bankHolder} onChange={(e) => updCompany({ bankHolder: e.target.value })} /></Field>
              </div>
              <div className="w-40"><p className="mb-1 text-xs font-medium text-slate-600">Upload QRIS (opsional)</p>
                <ImageUpload value={inv.qris} onChange={(v) => upd({ qris: v })} label="QRIS" autoRemoveBg={false} /></div>
            </div>
          </Card>

          <Card title="Invoice Details">
            <div className="space-y-3">
              <h3 className="text-3xl font-extrabold tracking-tight">INVOICE</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="No. Invoice"><Input value={inv.number} onChange={(e) => upd({ number: e.target.value })} /></Field>
                <Field label="Tanggal"><Input type="date" value={inv.date} onChange={(e) => upd({ date: e.target.value })} /></Field>
                <Field label="Jatuh Tempo"><Input type="date" value={inv.due} onChange={(e) => upd({ due: e.target.value })} /></Field>
              </div>
              <Field label="Bill To / Nama Client"><Input value={inv.clientName} onChange={(e) => upd({ clientName: e.target.value })} /></Field>
              <Field label="Alamat Client"><Textarea rows={2} value={inv.clientAddress} onChange={(e) => upd({ clientAddress: e.target.value })} /></Field>

              <div className="space-y-2">
                <div className="hidden grid-cols-[28px_1fr_70px_110px_110px_32px] gap-2 text-xs font-medium text-slate-500 sm:grid"><span>No</span><span>Deskripsi Item</span><span>Qty / Pcs</span><span>Harga Satuan</span><span>Total</span><span /></div>
                {inv.items.map((it, i) => (
                  <div key={it.id} className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[28px_1fr_70px_110px_110px_32px]">
                    <span className="hidden text-sm sm:block">{i + 1}</span>
                    <Input className="col-span-2 sm:col-span-1" placeholder="Deskripsi" value={it.desc} onChange={(e) => updItem(it.id, { desc: e.target.value })} />
                    <Input type="number" min={0} value={it.qty} onChange={(e) => updItem(it.id, { qty: +e.target.value })} />
                    <Input type="number" min={0} value={it.price} onChange={(e) => updItem(it.id, { price: +e.target.value })} />
                    <span className="text-sm font-medium">{(it.qty * it.price).toLocaleString("id-ID")}</span>
                    <Button variant="danger" size="sm" onClick={() => inv.items.length > 1 && upd({ items: inv.items.filter((x) => x.id !== it.id) })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => upd({ items: [...inv.items, { id: uid(), desc: "", qty: 1, price: 0 }] })}><Plus className="mr-1 h-4 w-4" />Tambah Item</Button>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{subtotal(inv).toLocaleString("id-ID")}</span></div>
                <div className="my-2 flex items-center justify-between gap-3"><span>Diskon (Rp)</span><Input className="w-40" type="number" min={0} value={inv.discount} onChange={(e) => upd({ discount: +e.target.value })} /></div>
                <div className="flex justify-between text-base font-bold"><span>Grand Total</span><span>Rp {grandTotal(inv).toLocaleString("id-ID")}</span></div>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Terbilang" value={inv.terbilang} onChange={(e) => upd({ terbilang: e.target.value })} />
                  <Button variant="outline" onClick={() => upd({ terbilang: terbilang(grandTotal(inv)) })}>Auto Terbilang</Button>
                </div>
              </div>

            </div>
          </Card>

          <Card title="Custom Elements">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Signature Pad / Tanda Tangan</h3>
                <p className="mb-2 text-xs text-slate-500">Draw your signature below / Gambar tanda tangan di bawah</p>
                <SignaturePadBox key={inv.id} initial={sig} onChange={(v) => setPending({ sig: v })} />
              </div>
              <div>
                <h3 className="font-semibold">Custom Stamp / Stempel Custom</h3>
                <p className="mb-2 text-xs text-slate-500">Upload your stamp / Unggah stempelmu</p>
                <ImageUpload value={stamp} onChange={(v) => setPending({ stamp: v })} label="Tap to upload PNG/JPG - Max 5MB" />
                <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border bg-white">
                  {stamp ? <img src={stamp} alt="stamp" className="h-full w-full object-contain" /> : <span className="-rotate-12 text-center text-sm font-extrabold text-red-500">PAID<br />LUNAS</span>}
                </div>
                <p className="mt-2 text-center text-xs text-slate-500">Auto remove background - Latar belakang akan otomatis dihapus</p>
              </div>
            </div>
            <Button className="mt-6 h-12 w-full text-base" onClick={apply}>{applied ? "Applied ✓" : "Apply to Invoice / Terapkan ke Invoice"}</Button>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={addInvoice} disabled={invoices.length >= MAX}><Plus className="mr-1 h-4 w-4" />Tambah Draft Baru ({invoices.length}/{MAX})</Button>
            {invoices.length > 1 && <Button variant="danger" onClick={() => removeInvoice(active)}>Hapus Draft {active + 1}</Button>}
          </div>
        </motion.div>
        </AnimatePresence>

        {/* Live preview */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Button variant="outline" className="w-full" onClick={() => setTplMode("change")}>🎨 Template: {TEMPLATES[(inv.template || 1) - 1].name} (20 gratis)</Button>
          <div ref={previewWrap} className="w-full overflow-hidden rounded-xl border bg-slate-200" style={{ height: 1123 * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}><AnimatePresence mode="wait" initial={false}><motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><InvoicePaper inv={inv} /></motion.div></AnimatePresence></div>
          </div>
          <Button size="lg" className="w-full" disabled={busy} onClick={onDownload}>
            <Download className="mr-2 h-5 w-5" />{busy ? "Generating..." : `Download Draft (${invoices.length})`}
          </Button>
        </div>
      </div>

      {/* Render offscreen untuk generate PDF semua invoice */}
      <div style={{ position: "fixed", left: -10000, top: 0 }} aria-hidden>
        {invoices.map((x) => <InvoicePaper key={x.id} id={`pdf-${x.id}`} inv={x} />)}
      </div>

      <AdGateModal open={!!ad} title={ad === "add" ? "Tambah Draft" : "Download Draft"} onClose={() => setAd(null)} onRewarded={onRewarded} />
      <TemplatePicker open={!!tplMode} current={inv.template} onClose={() => setTplMode(null)} onPick={pickTemplate} />
    </main>
  );
}
