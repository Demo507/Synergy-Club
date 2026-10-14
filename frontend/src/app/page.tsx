/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useState } from "react";
import type { ElementType } from "react";
import { ethers } from "ethers";
import { Award, Layers, MessageSquare, Radio, Shield, Terminal, Video } from "lucide-react";
import MarqueeHeader from "@/components/MarqueeHeader";
import RegisterTab from "@/components/RegisterTab";
import StatusTab from "@/components/StatusTab";
import ChatTab from "@/components/ChatTab";
import MeetingsTab from "@/components/MeetingsTab";
import PaymentsTab from "@/components/PaymentsTab";
import AchievementsTab from "@/components/AchievementsTab";
import AdminTab from "@/components/AdminTab";
import { api, setToken } from "@/lib/api";
import { ensureSepolia } from "@/config/web3";
import { btn, input } from "@/lib/ui";

type Session = { address: string; role: string; profile: any };

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState("");
  const [gateOk, setGateOk] = useState(false);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("register");
  const [members, setMembers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (window as any).ethereum?.on?.("accountsChanged", () => window.location.reload());
  }, []);

  const loadSession = useCallback(async () => {
    const s: Session = await api("/api/session");
    setSession(s);
    if (["ADMIN", "ACTIVATED"].includes(s.role)) {
      const list = await api("/api/members");
      setMembers(list.map((m: any) => m.name));
      setTab("chat");
    } else {
      setTab(s.role === "GUEST" ? "register" : "status");
    }
  }, []);

  const connect = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return alert("MetaMask not found. Install it first.");
    setBusy(true);
    try {
      await ensureSepolia();
      const provider = new ethers.BrowserProvider(eth);
      const [addr]: string[] = await provider.send("eth_requestAccounts", []);
      const { message } = await api(`/api/auth/nonce?address=${addr}`);
      const signature = await (await provider.getSigner()).signMessage(message);
      const { token } = await api("/api/auth/login", { address: addr, signature });
      setToken(token);
      setAccount(addr.toLowerCase());
      await loadSession();
    } catch (e: any) {
      alert(e.shortMessage || e.message || "Could not connect.");
    }
    setBusy(false);
  };

  const verifyCode = async () => {
    try {
      await api("/api/gate/verify", { code });
      setGateOk(true);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ---------- Gate ----------
  if (!session || (session.role === "GUEST" && !gateOk)) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 font-mono">
        <div className="max-w-lg w-full border border-neutral-800 bg-neutral-900/40 rounded-2xl p-10 text-center space-y-6 border-t-amber-500/20">
          <div className="text-7xl animate-pulse">🤝</div>
          <h1 className="text-xl font-bold tracking-[0.3em] text-amber-400 uppercase">Synergy Gated Terminal</h1>
          <p className="text-[11px] text-neutral-400">AUTHENTICATION REQUIRED // RECRUIT ONBOARDING CHANNEL</p>
          {!session ? (
            <button onClick={connect} disabled={busy} className={btn + " w-full"}>
              {busy ? "Waiting for wallet..." : "Connect wallet and sign in"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-emerald-400">CONNECTED: {account.slice(0, 10)}...</p>
              <input
                className={input + " text-center tracking-[0.2em] text-amber-400 font-bold"}
                placeholder="ENTER INVITATION CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <button onClick={verifyCode} className={btn + " w-full"}>
                Enter
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isMember = ["ADMIN", "ACTIVATED"].includes(session.role);
  const canInterview = session.role === "ADMIN" || !!session.profile?.isInterviewer;
  const tabs: [string, string, ElementType][] = isMember
    ? [
        ["chat", "Chat", MessageSquare],
        ["meetings", "Meetings", Video],
        ["payments", "Payments", Layers],
        ["achievements", "Achievements", Award],
        ...(canInterview ? ([["admin", session.role === "ADMIN" ? "Admin" : "Interviews", Shield]] as [string, string, ElementType][]) : []),
      ]
    : session.role === "GUEST"
    ? [["register", "Register", Terminal]]
    : [["status", "My Status", Radio]];

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-200 flex flex-col antialiased selection:bg-amber-500 selection:text-black">
      <MarqueeHeader members={members} />
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <h1 className="font-mono font-bold tracking-widest text-amber-400">🤝 SYNERGY SHAKING HANDS CLUB</h1>
        <span className="text-[11px] font-mono text-neutral-400">
          {session.role} // {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      </header>
      <nav className="flex flex-wrap gap-2 px-6 py-3 border-b border-neutral-800">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              tab === id ? "bg-amber-500 text-black" : "bg-neutral-900 text-neutral-400 hover:text-white"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </nav>
      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        {tab === "register" && <RegisterTab account={account} code={code} onDone={loadSession} />}
        {tab === "status" && <StatusTab session={session} account={account} onChange={loadSession} />}
        {tab === "chat" && <ChatTab account={account} />}
        {tab === "meetings" && <MeetingsTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "achievements" && <AchievementsTab role={session.role} />}
        {tab === "admin" && <AdminTab isAdmin={session.role === "ADMIN"} me={account} />}
      </main>
    </div>
  );
}
