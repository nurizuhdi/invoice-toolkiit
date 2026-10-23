import { Invoice } from "./types";

export async function generateZip(invoices: Invoice[]) {
  const [{ default: html2canvas }, { jsPDF }, { default: JSZip }] = await Promise.all([import("html2canvas"), import("jspdf"), import("jszip")]);
  const zip = new JSZip();
  for (let i = 0; i < invoices.length; i++) {
    const el = document.getElementById(`pdf-${invoices[i].id}`);
    if (!el) continue;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const w = 210, h = Math.min(297, (canvas.height * w) / canvas.width);
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, w, h);
    const safe = (invoices[i].number || `invoice-${i + 1}`).replace(/[^\w-]+/g, "_");
    zip.file(`${safe}.pdf`, pdf.output("arraybuffer"));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `invoices-toolkiit-${Date.now()}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
