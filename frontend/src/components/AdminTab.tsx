/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { readContract, writeContract } from "@/config/web3";
import { btn, btnGhost, card, input } from "@/lib/ui";

export default function AdminTab({ isAdmin, me }: { isAdmin: boolean; me: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");

  const load = useCallback(() => api("/api/interview/applicants").then(setRows).catch((e) => alert(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
      await load();
    } catch (e: any) {
      alert(e.shortMessage || e.message);
    }
    setBusy("");
  };

  const approve = (w: string) =>
    run(w, async () => {
      if (!(await readContract().isApproved(w))) {
        const tx = await (await writeContract()).approveApplicant(w);
        await tx.wait();
      }
      await api("/api/admin/approve", { wallet: w });
    });

  const expel = (w: string) =>
    run(w, async () => {
      if (await readContract().isFullyActivated(w)) {
        const tx = await (await writeContract()).expelMember(w);
        await tx.wait();
      }
      await api("/api/admin/expel", { wallet: w });
    });

  const withdraw = () =>
    run("withdraw", async () => {
      const tx = await (await writeContract()).withdrawFunds();
      await tx.wait();
      alert("Funds withdrawn to your wallet.");
    });

  const addNote = (w: string) =>
    run(w, async () => {
      await api("/api/interview/note", { wallet: w, text: notes[w] || "" });
      setNotes((n) => ({ ...n, [w]: "" }));
    });

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className={card + " flex items-center justify-between"}>
          <span className="text-sm">Collected fees sit in the contract until you withdraw them.</span>
          <button onClick={withdraw} disabled={busy === "withdraw"} className={btn}>Withdraw funds</button>
        </div>
      )}
      {rows.filter((r) => r.walletAddress !== me).map((r) => (
        <div key={r.walletAddress} className={card + " space-y-3"}>
          <div className="flex gap-4">
            {r.photo && <img src={r.photo} alt={r.name} className="w-20 h-20 rounded-lg object-cover" />}
            <div className="text-sm space-y-1">
              <div className="font-bold">{r.name} <span className="ml-2 text-[11px] font-mono text-amber-400">{r.status}</span></div>
              <div className="text-xs text-neutral-400 font-mono">{r.walletAddress}</div>
              <div className="text-xs">Age {r.age} | {r.email} | {r.phoneNumber}</div>
              <div className="text-xs">Drugs: {r.isDrugAddict ? "yes" : "no"} | Drinks: {r.isDrunker ? "yes" : "no"} | Cult: {r.isCultist ? "yes" : "no"}</div>
            </div>
          </div>
          <p className="text-sm text-neutral-300">{r.intentions}</p>
          {(r.notes || []).map((n: any, i: number) => (
            <p key={i} className="text-xs text-neutral-400 border-l-2 border-amber-500/40 pl-2">{n.text}</p>
          ))}
          <div className="flex gap-2">
            <input className={input} placeholder="Interview note" value={notes[r.walletAddress] || ""} onChange={(e) => setNotes((n) => ({ ...n, [r.walletAddress]: e.target.value }))} />
            <button onClick={() => addNote(r.walletAddress)} className={btnGhost}>Add</button>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {r.status === "PENDING_INTERVIEW" && (
                <>
                  <button disabled={busy === r.walletAddress} onClick={() => approve(r.walletAddress)} className={btn}>Approve</button>
                  <button disabled={busy === r.walletAddress} onClick={() => run(r.walletAddress, () => api("/api/admin/reject", { wallet: r.walletAddress }))} className={btnGhost}>Reject</button>
                </>
              )}
              {r.status === "ACTIVATED" && (
                <>
                  <button disabled={busy === r.walletAddress} onClick={() => run(r.walletAddress, () => api("/api/admin/interviewer", { wallet: r.walletAddress, value: !r.isInterviewer }))} className={btnGhost}>
                    {r.isInterviewer ? "Remove interviewer" : "Make interviewer"}
                  </button>
                  <button disabled={busy === r.walletAddress} onClick={() => expel(r.walletAddress)} className={btnGhost}>Expel</button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-neutral-500">No applicants yet.</p>}
    </div>
  );
}
