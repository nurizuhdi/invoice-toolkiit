import { Invoice, subtotal, grandTotal } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { rupiah } from "@/lib/utils";

// Dipakai untuk live preview & render PDF. Inline style agar html2canvas akurat. A4 @96dpi = 794x1123.
export default function InvoicePaper({ inv, id }: { inv: Invoice; id?: string }) {
  const t = TEMPLATES[(inv.template || 1) - 1] || TEMPLATES[0];
  const a = t.accent, center = t.head === "center";
  const sub = subtotal(inv), total = grandTotal(inv);
  const th: React.CSSProperties = {
    background: t.table === "fill" ? a : "#f3f4f6", color: t.table === "fill" ? "#fff" : "#111827", padding: "8px", textAlign: "left", fontSize: 12,
    ...(t.table === "grid" ? { border: `1px solid ${a}` } : { borderTop: `2px solid ${a}`, borderBottom: `2px solid ${a}` }),
  };
  const td = (i: number): React.CSSProperties => ({
    padding: "8px", fontSize: 12, verticalAlign: "top", background: t.table === "zebra" && i % 2 ? "#f8fafc" : undefined,
    ...(t.table === "grid" ? { border: `1px solid ${a}66` } : { borderBottom: "1px solid #e5e7eb" }),
  });
  const head: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", gap: 16, flexDirection: center ? "column" : "row", alignItems: center ? "center" : "stretch", textAlign: center ? "center" : "left",
    ...(t.head === "line" ? { borderBottom: `2px solid ${a}`, paddingBottom: 12 } : {}),
    ...(t.head === "box" ? { border: `1.5px solid ${a}`, padding: 12, borderRadius: 6 } : {}),
  };
  return (
    <div id={id} style={{ width: 794, minHeight: 1123, background: "#fff", color: "#111827", fontFamily: `${t.font}, Arial, sans-serif`, boxSizing: "border-box", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", borderTop: t.head === "band" ? `14px solid ${a}` : undefined }}>
      {inv.logo && <img src={inv.logo} alt="" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 420, maxHeight: 420, objectFit: "contain", opacity: 0.08, pointerEvents: "none", zIndex: 0 }} />}
      <div style={{ position: "relative", zIndex: 1, padding: 48, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={head}>
          <div style={{ display: "flex", gap: 12, flexDirection: center ? "column" : "row", alignItems: center ? "center" : "flex-start" }}>
            {inv.logo && <img src={inv.logo} alt="logo" style={{ height: 64, maxWidth: 140, objectFit: "contain" }} />}
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{inv.companyName || "Nama Usaha"}</div>
              <div style={{ whiteSpace: "pre-line" }}>{inv.address}</div>
              {inv.wa && <div>WA: {inv.wa}</div>}
              {inv.npwp && <div>NPWP: {inv.npwp}</div>}
            </div>
          </div>
          <div style={{ textAlign: center ? "center" : "right" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: a }}>INVOICE</div>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              <div><b>No:</b> {inv.number}</div><div><b>Tanggal / Date:</b> {inv.date}</div><div><b>Jatuh Tempo / Due:</b> {inv.due}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28, fontSize: 12, lineHeight: 1.5 }}>
          <div style={{ color: "#6b7280", fontWeight: 700 }}>Kepada / Bill To</div>
          <div style={{ fontWeight: 700 }}>{inv.clientName || "-"}</div>
          <div style={{ whiteSpace: "pre-line" }}>{inv.clientAddress}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
          <thead><tr><th style={{ ...th, width: 32 }}>No</th><th style={th}>Deskripsi / Description</th><th style={{ ...th, width: 50 }}>Qty</th><th style={{ ...th, width: 110, textAlign: "right" }}>Harga / Price</th><th style={{ ...th, width: 120, textAlign: "right" }}>Total</th></tr></thead>
          <tbody>{inv.items.map((it, i) => (
            <tr key={it.id}><td style={td(i)}>{i + 1}</td><td style={td(i)}>{it.desc}</td><td style={td(i)}>{it.qty}</td><td style={{ ...td(i), textAlign: "right" }}>{rupiah(it.price)}</td><td style={{ ...td(i), textAlign: "right" }}>{rupiah(it.qty * it.price)}</td></tr>
          ))}</tbody>
        </table>

        <div style={{ marginLeft: "auto", marginTop: 12, width: 280, fontSize: 12, lineHeight: 1.8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{rupiah(sub)}</span></div>
          {inv.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Diskon / Discount</span><span>- {rupiah(inv.discount)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, borderTop: `2px solid ${a}`, paddingTop: 4 }}><span>Grand Total</span><span>{rupiah(total)}</span></div>
        </div>
        {inv.terbilang && <div style={{ fontSize: 12, marginTop: 8, fontStyle: "italic" }}><b>Terbilang:</b> {inv.terbilang}</div>}

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 12, lineHeight: 1.6 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Info Pembayaran / Payment Info</div>
            <div>{inv.bankName}</div><div>No. Rek: {inv.bankNo}</div><div>a.n. {inv.bankHolder}</div>
          </div>
          {inv.qris && <img src={inv.qris} alt="QRIS" style={{ width: 90, height: 90, objectFit: "contain" }} />}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 40, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <div style={{ width: 220, textAlign: "center" }}>
            <div>Tanda Tangan / Signature</div>
            <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>{inv.signature && <img src={inv.signature} alt="ttd" style={{ maxHeight: 100, maxWidth: 200 }} />}</div>
            <div style={{ borderTop: "1px solid #111827", paddingTop: 4 }}>{inv.companyName}</div>
          </div>
          <div style={{ width: 220, textAlign: "center" }}>
            <div>Stempel / Stamp</div>
            <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>{inv.stamp && <img src={inv.stamp} alt="stamp" style={{ maxHeight: 100, maxWidth: 140, objectFit: "contain" }} />}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
