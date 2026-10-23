const S = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
function t(n: number): string {
  n = Math.floor(n);
  if (n < 12) return S[n];
  if (n < 20) return t(n - 10) + " belas";
  if (n < 100) return t(Math.floor(n / 10)) + " puluh" + (n % 10 ? " " + t(n % 10) : "");
  if (n < 200) return "seratus" + (n > 100 ? " " + t(n - 100) : "");
  if (n < 1000) return t(Math.floor(n / 100)) + " ratus" + (n % 100 ? " " + t(n % 100) : "");
  if (n < 2000) return "seribu" + (n > 1000 ? " " + t(n - 1000) : "");
  if (n < 1e6) return t(Math.floor(n / 1000)) + " ribu" + (n % 1000 ? " " + t(n % 1000) : "");
  if (n < 1e9) return t(Math.floor(n / 1e6)) + " juta" + (n % 1e6 ? " " + t(n % 1e6) : "");
  if (n < 1e12) return t(Math.floor(n / 1e9)) + " miliar" + (n % 1e9 ? " " + t(n % 1e9) : "");
  return t(Math.floor(n / 1e12)) + " triliun" + (n % 1e12 ? " " + t(n % 1e12) : "");
}
export function terbilang(n: number): string {
  if (!n || n <= 0) return "Nol Rupiah";
  const s = t(n) + " rupiah";
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
