import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
export const rupiah = (n: number) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
