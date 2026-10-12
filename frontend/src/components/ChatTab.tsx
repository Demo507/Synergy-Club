"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API, api, getToken } from "@/lib/api";
import { btn, card, input } from "@/lib/ui";

type Msg = { from: string; to: string; text: string; createdAt: string };
type Person = { name: string; walletAddress: string };

export default function ChatTab({ account }: { account: string }) {
  const [target, setTarget] = useState("group");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const sock = useRef<Socket | null>(null);
  const targetRef = useRef("group");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    targetRef.current = target;
    api(`/api/chat/history?with=${target}`).then(setMsgs).catch(() => setMsgs([]));
  }, [target]);

  useEffect(() => {
    api("/api/members").then(setPeople).catch(() => {});
    const s = io(API, { auth: { token: getToken() } });
    sock.current = s;
    s.on("message", (m: Msg) => {
      const t = targetRef.current;
      const inThread = t === "group" ? m.to === "group" : (m.from === account && m.to === t) || (m.from === t && m.to === account);
      if (inThread) setMsgs((prev) => [...prev, m]);
    });
    return () => {
      s.disconnect();
    };
  }, [account]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const nameOf = (w: string) => people.find((p) => p.walletAddress === w)?.name || w.slice(0, 8);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sock.current?.emit("message", { to: target, text });
    setText("");
  };

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-4">
      <div className={card + " space-y-1 !p-3 max-h-96 overflow-y-auto"}>
        <button onClick={() => setTarget("group")} className={`w-full text-left px-3 py-2 rounded text-xs ${target === "group" ? "bg-amber-500 text-black" : "hover:bg-neutral-800"}`}>
          # Group chat
        </button>
        {people.filter((p) => p.walletAddress !== account).map((p) => (
          <button key={p.walletAddress} onClick={() => setTarget(p.walletAddress)} className={`w-full text-left px-3 py-2 rounded text-xs ${target === p.walletAddress ? "bg-amber-500 text-black" : "hover:bg-neutral-800"}`}>
            {p.name}
          </button>
        ))}
      </div>
      <div className={card + " flex flex-col"}>
        <div className="h-96 overflow-y-auto space-y-2 mb-3">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === account ? "ml-auto bg-amber-500/20" : "bg-neutral-800"}`}>
              <div className="text-[10px] text-neutral-400">{nameOf(m.from)}</div>
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
