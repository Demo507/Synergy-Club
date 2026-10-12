/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import { API, api, getToken } from "@/lib/api";
import { btn, btnGhost, card } from "@/lib/ui";

const ROOM = process.env.NEXT_PUBLIC_JITSI_ROOM || "SynergyClubRoom";
const DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si";

export default function MeetingsTab() {
  const [joined, setJoined] = useState(false);
  const [recording, setRecording] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const load = () => api("/api/meetings").then(setList).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      chunks.current = [];
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const fd = new FormData();
        fd.append("meetingName", `Meeting ${new Date().toLocaleString()}`);
        fd.append("video", new Blob(chunks.current, { type: "video/webm" }), "meeting.webm");
        const res = await fetch(`${API}/api/meetings/recordings`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
        if (res.ok) load();
        else alert("Upload failed.");
      };
      stream.getVideoTracks()[0].onended = () => rec.state !== "inactive" && rec.stop();
      rec.start(1000);
      recRef.current = rec;
      setRecording(true);
    } catch {
      alert("Recording cancelled or not allowed. Choose this browser tab and tick Share tab audio.");
    }
  };

  const play = async (id: string) => {
    const res = await fetch(`${API}/api/meetings/${id}/file`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) setVideoUrl(URL.createObjectURL(await res.blob()));
  };

  return (
    <div className="space-y-4">
      <div className={card + " space-y-3"}>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setJoined(true)} className={btn}>Join meeting room</button>
          {!recording ? (
            <button onClick={startRec} className={btnGhost}>Start recording</button>
          ) : (
            <button onClick={() => recRef.current?.stop()} className={btnGhost}>Stop and save recording</button>
          )}
        </div>
        {joined && (
          <iframe
            src={`https://${DOMAIN}/${ROOM}`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-[480px] rounded-lg border border-neutral-800"
          />
        )}
      </div>
      <div className={card + " space-y-2"}>
        <h3 className="font-mono text-amber-400 uppercase text-sm tracking-widest">Recordings</h3>
        {list.length === 0 && <p className="text-xs text-neutral-500">No recordings yet.</p>}
        {list.map((r) => (
          <div key={r._id} className="flex items-center justify-between text-sm">
            <span>{r.meetingName}</span>
            <button onClick={() => play(r._id)} className={btnGhost}>Watch</button>
          </div>
        ))}
        {videoUrl && <video src={videoUrl} controls className="w-full rounded-lg" />}
      </div>
    </div>
  );
}
