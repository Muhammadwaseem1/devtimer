import { useState, useEffect, useRef, useCallback } from "react";

const MODES = {
  work:       { label: "Focus",       duration: 25 * 60, color: "#7c3aed" },
  shortBreak: { label: "Short Break", duration:  5 * 60, color: "#22c55e" },
  longBreak:  { label: "Long Break",  duration: 15 * 60, color: "#06b6d4" },
} as const;
type Mode = keyof typeof MODES;

function beep(ctx: AudioContext, freq: number, duration: number, vol = 0.3) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export default function Pomodoro() {
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [customWork, setCustomWork] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = mode === "work" ? customWork * 60 : MODES[mode].duration;
  const progress = 1 - secondsLeft / total;
  const color = MODES[mode].color;
  const R = 90;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - progress);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const playDone = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    const ctx = audioRef.current;
    beep(ctx, 880, 0.15);
    setTimeout(() => beep(ctx, 1100, 0.15), 200);
    setTimeout(() => beep(ctx, 1320, 0.3), 400);
  }, []);

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setSecondsLeft(m === "work" ? customWork * 60 : MODES[m].duration);
    setRunning(false);
  }, [customWork]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            playDone();
            if (mode === "work") setSessions(n => n + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, mode, playDone]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(mode === "work" ? customWork * 60 : MODES[mode].duration);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Pomodoro</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Focus in sprints. Ship more, stress less.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            {sessions} session{sessions !== 1 ? "s" : ""}
          </span>
          <button onClick={() => setShowSettings(s => !s)}
            className="text-xs px-3 py-1 rounded-full transition-colors"
            style={{ background: showSettings ? "var(--accent)" : "var(--surface)", color: showSettings ? "white" : "var(--muted)", border: "1px solid var(--border)" }}>
            ⚙ Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Focus duration (min)</label>
          <input type="number" min={1} max={90} value={customWork}
            onChange={e => { const v = Math.max(1, Math.min(90, +e.target.value)); setCustomWork(v); if (mode === "work") setSecondsLeft(v * 60); }}
            className="w-16 px-2 py-1 rounded-lg text-sm text-center outline-none"
            style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }} />
        </div>
      )}

      <div className="flex gap-2 mb-8 p-1 rounded-xl w-fit mx-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: mode === m ? MODES[m].color : "transparent", color: mode === m ? "white" : "var(--muted)" }}>
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative" style={{ width: 220, height: 220 }}>
          <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle cx="110" cy="110" r={R} fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "none", filter: `drop-shadow(0 0 8px ${color}66)` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold tracking-tight" style={{ color: "var(--text)" }}>
              {mins}:{secs}
            </span>
            <span className="text-xs mt-1 font-medium uppercase tracking-widest" style={{ color }}>
              {MODES[mode].label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
          Reset
        </button>
        <button onClick={() => setRunning(r => !r)}
          className="px-10 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: running ? "var(--red)" : color, minWidth: 140, boxShadow: running ? "none" : `0 0 20px ${color}55` }}>
          {running ? "⏸ Pause" : secondsLeft === total ? "▶ Start" : "▶ Resume"}
        </button>
      </div>
    </div>
  );
}
