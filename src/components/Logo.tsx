import { Link } from "react-router-dom";
import { Command } from "lucide-react";

export default function Logo({ size = "medium" }: { showText?: boolean; size?: "small" | "medium" | "large" }) {
  return <Link to="/" className="inline-flex gap-2.5 items-center" aria-label="Compufy Investments home">
    <span className="bg-primary text-white p-2 rounded-xl"><Command size={size === "small" ? 19 : 25} strokeWidth={1.7} /></span>
    <span><span className="block text-2xl font-bold tracking-tighter leading-none">compufy<span className="text-primary">.</span></span><span className="block text-[8px] tracking-[.27em] uppercase mt-1 text-muted-foreground">Investments</span></span>
  </Link>;
}
