export type Item = { id: string; desc: string; qty: number; price: number };
export type Invoice = {
  id: string;
  companyName: string; wa: string; address: string; npwp: string; logo: string;
  number: string; date: string; due: string;
  clientName: string; clientAddress: string;
  items: Item[]; discount: number; terbilang: string;
  bankName: string; bankNo: string; bankHolder: string; qris: string;
  signature: string; stamp: string; template: number;
};
export const uid = () => Math.random().toString(36).slice(2, 10);
export const today = () => new Date().toISOString().slice(0, 10);
export const subtotal = (i: Invoice) => i.items.reduce((s, x) => s + (x.qty || 0) * (x.price || 0), 0);
export const grandTotal = (i: Invoice) => Math.max(0, subtotal(i) - (i.discount || 0));
export function newInvoice(index: number, base?: Invoice, template = 1): Invoice {
  const saved = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("tk_company") || "{}") : {};
  const y = new Date().getFullYear();
  return {
    id: uid(),
    companyName: base?.companyName ?? saved.companyName ?? "", wa: base?.wa ?? saved.wa ?? "",
    address: base?.address ?? saved.address ?? "", npwp: base?.npwp ?? saved.npwp ?? "", logo: base?.logo ?? "",
    number: `INV-${y}-${String(index + 1).padStart(3, "0")}`, date: today(), due: today(),
    clientName: "", clientAddress: "",
    items: [{ id: uid(), desc: "", qty: 1, price: 0 }], discount: 0, terbilang: "",
    bankName: base?.bankName ?? saved.bankName ?? "", bankNo: base?.bankNo ?? saved.bankNo ?? "", bankHolder: base?.bankHolder ?? saved.bankHolder ?? "", qris: base?.qris ?? "",
    signature: "", stamp: "", template,
  };
}
