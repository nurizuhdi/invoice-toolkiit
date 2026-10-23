"use client";
import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import { Button } from "./ui";

export default function SignaturePadBox({ onChange, initial }: { onChange: (png: string) => void; initial?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pad = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const c = canvas.current!;
    const resize = () => {
      const data = pad.current?.toData();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      c.width = c.offsetWidth * ratio; c.height = c.offsetHeight * ratio;
      c.getContext("2d")!.scale(ratio, ratio);
      pad.current?.clear();
      if (data) pad.current?.fromData(data);
    };
    pad.current = new SignaturePad(c, { penColor: "#111827" });
    resize();
    if (initial) pad.current.fromDataURL(initial, { width: c.offsetWidth, height: c.offsetHeight }).catch(() => {});
    pad.current.addEventListener("endStroke", () => onChange(pad.current!.toDataURL("image/png")));
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); pad.current?.off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <canvas ref={canvas} className="h-48 w-full touch-none rounded-xl border-2 border-dashed border-slate-300 bg-white" />
      <Button variant="outline" size="sm" className="mt-2" onClick={() => { pad.current?.clear(); onChange(""); }}>Clear / Hapus</Button>
    </div>
  );
}
