export type Template = { id: number; name: string; font: string; accent: string; head: "band" | "line" | "box" | "center"; table: "fill" | "line" | "zebra" | "grid" };
const raw: [string, string, string, Template["head"], Template["table"]][] = [
  ["Klasik Hitam", "Arial", "#111827", "line", "line"],
  ["Minimal Abu", "Helvetica", "#4b5563", "line", "zebra"],
  ["Elegan Serif", "Georgia", "#1f2937", "center", "line"],
  ["Korporat Hitam", "Arial", "#0b0b0b", "band", "fill"],
  ["Hijau Olive", "Trebuchet MS", "#6B7A2F", "band", "fill"],
  ["Merah Maroon", "Arial", "#7f1d1d", "line", "fill"],
  ["Modern Teal", "Verdana", "#0f766e", "box", "zebra"],
  ["Kreatif Oranye", "Trebuchet MS", "#c2410c", "band", "grid"],
  ["Formal Coklat", "Georgia", "#5b4636", "center", "grid"],
  ["Slate Hijau", "Tahoma", "#3f4a3c", "box", "line"],
  ["Emerald", "Arial", "#047857", "line", "zebra"],
  ["Burgundy Serif", "Georgia", "#6b1e2e", "center", "fill"],
  ["Charcoal Mono", "Courier New", "#222222", "line", "grid"],
  ["Sunset", "Verdana", "#b45309", "band", "zebra"],
  ["Forest", "Georgia", "#14532d", "box", "fill"],
  ["Rose Dust", "Trebuchet MS", "#9f4a5a", "center", "line"],
  ["Pasir", "Tahoma", "#8a6d3b", "band", "line"],
  ["Graphite", "Arial", "#1f2937", "box", "grid"],
  ["Olive Merah", "Verdana", "#7a5c2e", "line", "fill"],
  ["Clean Putih", "Helvetica", "#111827", "center", "zebra"],
];
// 20 template, semuanya gratis
export const TEMPLATES: Template[] = raw.map(([name, font, accent, head, table], i) => ({ id: i + 1, name, font, accent, head, table }));
