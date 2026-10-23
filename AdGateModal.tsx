"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "./ui";

declare global { interface Window { googletag?: any } }
const UNIT = process.env.NEXT_PUBLIC_GAM_REWARDED_AD_UNIT; // contoh: /1234567/toolkiit_rewarded
const DEMO_SECONDS = 8;

type Props = { open: boolean; title: string; onClose: () => void; onRewarded: () => void };
export default function AdGateModal({ open, title, onClose, onRewarded }: Props) {
  const [state, setState] = useState<"loading" | "playing" | "noad">("loading");
  const [left, setLeft] = useState(DEMO_SECONDS);
  const [attempt, setAttempt] = useState(0);
  const cb = useRef(onRewarded); cb.current = onRewarded;

  useEffect(() => {
    if (!open) return;
    setState("loading");
    if (!UNIT) { // MODE DEMO: hitung mundur, bukan iklan asli
      let n = DEMO_SECONDS; setLeft(n); setState("playing");
      const timer = setInterval(() => { n--; setLeft(n); if (n <= 0) { clearInterval(timer); cb.current(); } }, 1000);
      return () => clearInterval(timer);
    }
    const w = window as any;
    w.googletag = w.googletag || { cmd: [] };
    if (!document.getElementById("gpt-js")) {
      const s = document.createElement("script");
      s.id = "gpt-js"; s.async = true; s.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
      document.head.appendChild(s);
    }
    const g = w.googletag;
    let slot: any, granted = false;
    g.cmd.push(() => {
      slot = g.defineOutOfPageSlot(UNIT, g.enums.OutOfPageFormat.REWARDED);
      if (!slot) return setState("noad");
      slot.addService(g.pubads());
      const ps = g.pubads();
      ps.addEventListener("rewardedSlotReady", (e: any) => { if (e.slot !== slot) return; e.makeRewardedVisible(); setState("playing"); });
      ps.addEventListener("rewardedSlotGranted", (e: any) => { if (e.slot === slot) granted = true; });
      ps.addEventListener("rewardedSlotClosed", (e: any) => { if (e.slot !== slot) return; g.destroySlots([slot]); if (granted) cb.current(); else setState("noad"); });
      ps.addEventListener("slotRenderEnded", (e: any) => { if (e.slot === slot && e.isEmpty) setState("noad"); });
      g.enableServices(); g.display(slot);
    });
    return () => { try { g.destroySlots(slot ? [slot] : []); } catch {} };
  }, [open, attempt]);

  return (
    <Modal open={open} onClose={state === "noad" ? onClose : () => {}}>
      <h2 className="mb-1 text-xl font-bold">{title}</h2>
      <p className="mb-4 text-sm text-slate-500">Iklan singkat sedang diputar, mohon tunggu. / A short ad is playing, please wait.</p>
      <div className="rounded-xl border-2 border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
        {state === "loading" ? "Memuat iklan..." : state === "playing" ? (UNIT ? "Iklan sedang diputar..." : `Iklan demo... ${left}s`) : "Iklan tidak tersedia saat ini"}
      </div>
      {!UNIT && <p className="mt-3 text-xs text-amber-700">Mode demo: isi NEXT_PUBLIC_GAM_REWARDED_AD_UNIT untuk iklan Google asli.</p>}
      {state === "noad" && (
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setAttempt((a) => a + 1)}>Coba Lagi</Button>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      )}
    </Modal>
  );
}
