/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API, api, getToken } from "@/lib/api";
import { btn, card, input } from "@/lib/ui";

type Msg = { id: string; from: string; to: string; text: string; createdAt: string };
type Person = { name: string; walletAddress: string };

export default function ChatTab({ account }: { account: string }) {
  const [target, setTarget] = useState("group");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [live, setLive] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const sock = useRef<Socket | null>(null);
  const targetRef = useRef("group");
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (t: string) => {
    try {
      setMsgs(await api(`/api/chat/history?with=${t}`));
    } catch {
      /* keep what is on screen */
    }
  }, []);

  const add = useCallback((m: Msg) => {
    setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  }, []);

  const open = (t: string) => {
    setTarget(t);
    setUnread((u) => ({ ...u, [t]: 0 }));
  };

  // Load the conversation and refresh it every 5 seconds as a safety net
  useEffect(() => {
    targetRef.current = target;
    load(target);
    const timer = setInterval(() => load(target), 5000);
    return () => clearInterval(timer);
  }, [target, load]);

  // Real-time connection
  useEffect(() => {
    api("/api/members").then(setPeople).catch(() => {});
    const s = io(API, { auth: { token: getToken() } });
    sock.current = s;
    s.on("connect", () => setLive(true));
    s.on("disconnect", () => setLive(false));
    s.on("connect_error", () => setLive(false));
    s.on("message", (m: Msg) => {
      const mine = m.from === account;
      const key = m.to === "group" ? "group" : mine ? m.to : m.from;
      if (key === targetRef.current) add(m);
      else if (!mine) setUnread((u) => ({ ...u, [key]: (u[key] || 0) + 1 }));
    });
    return () => {
      s.disconnect();
    };
  }, [account, add]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const nameOf = (w: string) => (w === account ? "You" : people.find((p) => p.walletAddress === w)?.name || w.slice(0, 8));
  const title = target === "group" ? "Group chat" : `Private chat with ${nameOf(target)}`;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    const s = sock.current;
    if (s && s.connected) {
      s.timeout(8000).emit("message", { to: target, text: body }, (err: any, res: any) => {
        if (err || !res?.ok) {
          setText(body);
          return alert(res?.error || "Message not delivered. Check your connection and try again.");
        }
        add(res.message);
      });
    } else {
      try {
        add(await api("/api/chat/send", { to: target, text: body }));
      } catch (e2: any) {
        setText(body);
        alert(e2.message);
      }
    }
  };

  const badge = (k: string) =>
    unread[k] ? <span className="ml-2 rounded-full bg-red-500 px-2 text-[10px] text-white">{unread[k]}</span> : null;
  const rowCls = (k: string) =>
    `w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between ${target === k ? "bg-amber-500 text-black" : "hover:bg-neutral-800"}`;

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-4">
      <div className={card + " space-y-1 !p-3 max-h-[70vh] overflow-y-auto"}>
        <button onClick={() => open("group")} className={rowCls("group")}>
          <span># Group chat</span>
          {badge("group")}
        </button>
        {people.filter((p) => p.walletAddress !== account).map((p) => (
          <button key={p.walletAddress} onClick={() => open(p.walletAddress)} className={rowCls(p.walletAddress)}>
            <span>{p.name}</span>
            {badge(p.walletAddress)}
          </button>
        ))}
      </div>
      <div className={card + " flex flex-col"}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">{title}</h3>
          <span className={`text-[10px] font-mono ${live ? "text-emerald-400" : "text-amber-400"}`}>
            {live ? "LIVE" : "RECONNECTING"}
          </span>
        </div>
        <div className="h-[55vh] overflow-y-auto space-y-2 mb-3 pr-1">
          {msgs.length === 0 && <p className="text-xs text-neutral-500">No messages yet. Say hello.</p>}
          {msgs.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === account ? "ml-auto bg-amber-500/20" : "bg-neutral-800"}`}>
              <div className="text-[10px] text-neutral-400">
                {nameOf(m.from)} · {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2">
          <input className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
          <button className={btn}>Send</button>
        </form>
      </div>
    </div>
  );
}
