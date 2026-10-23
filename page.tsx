"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";
import LoginModal from "@/components/LoginModal";

export default function Landing() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  async function start() {
    const { data } = await supabase.auth.getSession();
    if (data.session) router.push("/create"); else setOpen(true);
  }
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="absolute left-5 top-5 text-2xl font-extrabold text-toolkiit">Toolkiit</div>
      <Button size="lg" onClick={start}>Create Custom Invoice</Button>
      <LoginModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
