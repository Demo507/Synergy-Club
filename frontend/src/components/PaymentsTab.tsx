/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { readContract } from "@/config/web3";
import { card } from "@/lib/ui";

type Row = { payor: string; at: string; type: string; amount: string };

export default function PaymentsTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const c = readContract();
      const n = Number(await c.paymentCount());
      const list = n ? await c.getPayments(Math.max(0, n - 100), 100) : [];
      setRows(
        Array.from(list as any[])
          .map((p: any) => ({
            payor: p.payor,
            at: new Date(Number(p.timestamp) * 1000).toLocaleString(),
            type: Number(p.paymentType) === 0 ? "Registration" : "Activation",
            amount: ethers.formatEther(p.amount),
          }))
          .reverse()
      );
    })().catch(() => setErr("Could not read payments from the contract."));
  }, []);

  return (
    <div className={card + " overflow-x-auto"}>
      <h3 className="font-mono text-amber-400 uppercase text-sm tracking-widest mb-3">On-chain payment log</h3>
      {err && <p className="text-xs text-red-400">{err}</p>}
      <table className="w-full text-xs">
        <thead className="text-neutral-500 text-left">
          <tr><th className="py-2">Date</th><th>Payer</th><th>Type</th><th>ETH</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-neutral-800">
              <td className="py-2">{r.at}</td>
              <td className="font-mono">{r.payor.slice(0, 8)}...{r.payor.slice(-6)}</td>
              <td>{r.type}</td>
              <td>{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
