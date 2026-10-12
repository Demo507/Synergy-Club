"use client";
import "./marquee.css";

export default function MarqueeHeader({ members }: { members: string[] }) {
  const items = members.length ? members : ["Synergy Shaking Hands Club"];
  return (
    <div className="w-full bg-gradient-to-r from-neutral-900 via-amber-950/20 to-neutral-900 border-b border-amber-500/20 py-2.5 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-marquee text-[10px] font-mono uppercase tracking-widest text-amber-400">
        {items.map((m, i) => (
          <span key={i} className="mx-12 inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MEMBER ALIVE :: <span className="text-white font-bold">{m}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
