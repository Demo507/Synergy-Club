/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { btn, card } from "@/lib/ui";

export default function AchievementsTab({ role }: { role: string }) {
  const [codes, setCodes] = useState<any[]>([]);
  const load = () => api("/api/invites").then(setCodes).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    try {
      await api("/api/invites", {});
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const recruited = codes.filter((c) => c.isUsed).length;
  const badges: [string, boolean][] = [
    ["Active Member", true],
    ["Founder", role === "ADMIN"],
    ["Recruiter (1 invite used)", recruited >= 1],
    ["Ambassador (3 invites used)", recruited >= 3],
  ];

  return (
    <div className="space-y-4">
      <div className={card + " grid sm:grid-cols-4 gap-3"}>
        {badges.map(([name, earned]) => (
          <div key={name} className={`rounded-lg p-4 text-center text-xs font-bold ${earned ? "bg-amber-500/20 text-amber-300" : "bg-neutral-900 text-neutral-600"}`}>
            {earned ? "🏅" : "🔒"}
            <div className="mt-1">{name}</div>
          </div>
        ))}
      </div>
      <div className={card + " space-y-3"}>
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-amber-400 uppercase text-sm tracking-widest">Your invitation codes</h3>
          <button onClick={generate} className={btn}>Generate code</button>
        </div>
        <p className="text-xs text-neutral-500">Each code works once and expires after 30 days. Maximum 5 active codes.</p>
        {codes.map((c) => (
          <div key={c._id} className="flex justify-between text-sm font-mono border-t border-neutral-800 pt-2">
            <span className="text-amber-300 tracking-widest">{c.code}</span>
            <span className="text-xs text-neutral-400">
              {c.isUsed ? "used" : new Date(c.expiresAt) < new Date() ? "expired" : `expires ${new Date(c.expiresAt).toLocaleDateString()}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
