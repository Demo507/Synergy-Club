/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { api } from "@/lib/api";
import { readContract, writeContract } from "@/config/web3";
import { btn, card, input } from "@/lib/ui";

export default function RegisterTab({ account, code, onDone }: { account: string; code: string; onDone: () => Promise<void> }) {
  const [form, setForm] = useState({
    name: "", age: "", isDrugAddict: "no", isDrunker: "no", isCultist: "no", intentions: "", phoneNumber: "", email: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return alert("Please accept the terms.");
    setBusy(true);
    let step = "checking payment on the blockchain";
    try {
      const paid = await readContract().hasPaidRegistration(account);
      if (!paid) {
        step = "sending the 0.0001 ETH payment";
        const tx = await (await writeContract()).payRegistrationFee({ value: ethers.parseEther("0.0001") });
        step = "waiting for payment confirmation";
        await tx.wait();
      }
      step = "saving your details to the server";
      await api("/api/register", { ...form, code });
      await onDone();
    } catch (err: any) {
      alert(`Failed while ${step}: ` + (err.shortMessage || err.message || "unknown error"));
    }
    setBusy(false);
  };

  const yn = (k: string, label: string) => (
    <label className="block text-xs text-neutral-400 space-y-1">
      {label}
      <select className={input} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)}>
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </label>
  );

  return (
    <form onSubmit={submit} className={card + " space-y-4"}>
      <h2 className="font-mono font-bold text-amber-400 uppercase tracking-widest">Register</h2>
      <p className="text-xs text-neutral-400">Fill the form, then confirm the 0.0001 ETH registration fee in your wallet.</p>
      <input className={input} placeholder="Full name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
      <input className={input} placeholder="Age (18+)" type="number" min={18} required value={form.age} onChange={(e) => set("age", e.target.value)} />
      <div className="grid sm:grid-cols-3 gap-3">
        {yn("isDrugAddict", "Are you a drug addict?")}
        {yn("isDrunker", "Are you a heavy drinker?")}
        {yn("isCultist", "Are you in a cult?")}
      </div>
      <textarea className={input} rows={3} placeholder="Why do you want to join? Your intentions" required value={form.intentions} onChange={(e) => set("intentions", e.target.value)} />
      <input className={input} placeholder="Phone number" required value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} />
      <input className={input} placeholder="Email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
      <label className="flex gap-2 text-xs text-neutral-300">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
        I confirm my information is true. I understand fees are not refunded if any information is false.
      </label>
      <button disabled={busy} className={btn}>{busy ? "Processing..." : "Pay 0.0001 ETH and submit"}</button>
    </form>
  );
}
