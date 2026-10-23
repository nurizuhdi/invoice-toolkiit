import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Toolkiit Invoice Custom", description: "Invoice custom dengan logo, stempel & tanda tangan" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="id"><body>{children}</body></html>);
}
