/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { api } from "@/lib/api";
import { readContract, writeContract } from "@/config/web3";
import { btn, card } from "@/lib/ui";

export default function StatusTab({ session, account, onChange }: { session: any; account: string; onChange: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const p = session.profile;

  const activate = async () => {
    setBusy(true);
    try {
      if (!(await readContract().isFullyActivated(account))) {
        const tx = await (await writeContract()).completeFinalActivation({ value: ethers.parseEther("0.01") });
        await tx.wait();
      }
      await api("/api/activate", {});
      await onChange();
    } catch (e: any) {
      alert(e.shortMessage || e.message || "Activation failed");
    }
    setBusy(false);
  };

  return (
    <div className={card + " space-y-4"}>
      <div className="flex items-center gap-4">
        {p?.photo && <img src={p.photo} alt="You" className="w-16 h-16 rounded-lg object-cover" />}
        <div>
          <h2 className="font-bold text-lg">{p?.name}</h2>
          <span className="text-[11px] font-mono text-amber-400">{p?.status}</span>
        </div>
      </div>
      {p?.status === "PENDING_INTERVIEW" && (
        <p className="text-sm text-neutral-300">Your application is in the interview queue. You will be approved by the admin after your interview. Check back here.</p>
      )}
      {p?.status === "APPROVED" && (
        <>
          <p className="text-sm text-neutral-300">You are approved. Your registration code is:</p>
          <p className="text-2xl font-mono font-bold tracking-[0.3em] text-amber-400">{p.registrationCode}</p>
          <button onClick={activate} disabled={busy} className={btn}>{busy ? "Processing..." : "Pay 0.01 ETH and join"}</button>
        </>
      )}
      {p?.status === "REJECTED" && <p className="text-sm text-red-400">Your application was not accepted.</p>}
      {p?.status === "EXPELLED" && <p className="text-sm text-red-400">Your membership was revoked.</p>}
    </div>
  );
}
