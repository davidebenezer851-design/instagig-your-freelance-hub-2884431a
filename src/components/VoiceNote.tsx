import { useEffect, useRef, useState } from "react";
import { Pause, Play, Mic } from "lucide-react";

/** Minimal WhatsApp-style voice note player. */
export function VoiceNote({ src, mine, avatar }: { src: string; mine: boolean; avatar?: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [dur, setDur] = useState(0);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onMeta = () => { if (isFinite(a.duration)) setDur(a.duration); };
    const onTime = () => setPos(a.currentTime);
    const onEnd = () => { setPlaying(false); setPos(0); };
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  function fmt(s: number) {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60), ss = Math.floor(s % 60);
    return `${m}:${String(ss).padStart(2, "0")}`;
  }

  const pct = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;
  const barBg = mine ? "bg-primary-foreground/25" : "bg-primary/20";
  const barFg = mine ? "bg-primary-foreground" : "bg-primary";
  const btnBg = mine ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground";
  const badgeBg = mine ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary/10 text-primary";

  // Static waveform bars for a "sound wave silhouette" feel
  const bars = [3, 5, 8, 12, 9, 14, 7, 11, 6, 13, 5, 10, 8, 4, 9, 12, 6, 8, 5, 3];

  return (
    <div className="flex w-64 max-w-full items-center gap-3 px-3 py-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full shadow-sm transition active:scale-95 ${btnBg}`}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="relative h-6">
          {/* silhouette */}
          <div className="absolute inset-0 flex items-center gap-[2px]">
            {bars.map((h, i) => {
              const active = (i / bars.length) * 100 <= pct;
              return (
                <span
                  key={i}
                  className={`w-[2px] rounded-full ${active ? barFg : barBg}`}
                  style={{ height: `${h * 1.4}px` }}
                />
              );
            })}
          </div>
          {/* click-to-seek overlay */}
          <input
            type="range" min={0} max={dur || 0} step={0.01} value={pos}
            onChange={(e) => { const a = audioRef.current; if (!a) return; a.currentTime = Number(e.target.value); setPos(Number(e.target.value)); }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Seek voice note"
          />
        </div>
        <div className={`text-[10px] ${mine ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
          {fmt(playing || pos > 0 ? pos : dur)}
        </div>
      </div>

      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${badgeBg}`}>
        {avatar ?? <Mic className="h-3 w-3" />}
      </span>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
}
