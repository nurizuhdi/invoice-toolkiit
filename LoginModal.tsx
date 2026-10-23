"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button, Input, Modal } from "./ui";

declare global { interface Window { google?: any } }

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Google One Tap (butuh NEXT_PUBLIC_GOOGLE_CLIENT_ID + Google provider aktif di Supabase)
  useEffect(() => {
    const cid = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!open || !cid) return;
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = () => window.google?.accounts.id.initialize({
      client_id: cid,
      callback: async (r: { credential: string }) => {
        const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: r.credential });
        if (error) setErr(error.message); else { onClose(); router.push("/create"); }
      },
    }) && window.google.accounts.id.prompt();
    document.body.appendChild(s);
    return () => { s.remove(); window.google?.accounts.id.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function google() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/create` } });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    let error;
    if (mode === "signup") {
      const r = await supabase.auth.signUp({ email, password });
      error = r.error;
      // Jika "Confirm email" dimatikan di Supabase, session langsung ada. Jika email sudah terdaftar, fallback login.
      if (!error && !r.data.session) {
        const l = await supabase.auth.signInWithPassword({ email, password });
        error = l.error;
      }
      if (error?.message.toLowerCase().includes("registered")) error = (await supabase.auth.signInWithPassword({ email, password })).error;
    } else {
      error = (await supabase.auth.signInWithPassword({ email, password })).error;
    }
    setBusy(false);
    if (error) return setErr(error.message);
    onClose(); router.push("/create");
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-4 text-xl font-bold">{mode === "signup" ? "Buat Akun / Create Account" : "Login"}</h2>
      <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
      <div className="my-4 flex items-center gap-3 text-xs text-slate-400"><div className="h-px flex-1 bg-slate-200" />or<div className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-xs text-red-600">{err}</p>}
        <Button className="w-full" disabled={busy}>{busy ? "..." : mode === "signup" ? "Create Account / Login" : "Login"}</Button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-500">
        {mode === "signup" ? "Sudah punya akun? " : "Belum punya akun? "}
        <button className="font-medium text-toolkiit" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>{mode === "signup" ? "Login" : "Daftar"}</button>
      </p>
    </Modal>
  );
}
