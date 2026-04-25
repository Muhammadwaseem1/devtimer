import { useState, useEffect, useRef, useCallback } from "react";

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

const PRESETS = [
  { label: "1 min",   seconds: 60 },
  { label: "5 min",   seconds: 300 },
  { label: "10 min",  seconds: 600 },
  { label: "30 min",  seconds: 1800 },
  { label: "1 hour",  seconds: 3600 },
];

export default function Countdown() {
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(5);
  const [inputS, setInputS] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const totalInput = inputH * 3600 + inputM * 60 + inputS;

  const playDone = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    const ctx = audioRef.current;
    [0, 200, 400, 700].forEach((delay, i) =>
      setTimeout(() => beep(ctx, i % 2 === 0 ? 660 : 880, 0.25), delay)
    );
  }, []);

  useEffect(() => {
    if (running && secondsLeft !== null) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s === null || s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
            playDone();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, playDone]);

  const start = () => {
    if (totalInput === 0) return;
    setDone(false);
    setSecondsLeft(totalInput);
    setRunning(true);
  };

  const pause = () => setRunning(r => !r);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(null);
    setDone(false);
  };

  const applyPreset = (s: number) => {
    setInputH(Math.floor(s / 3600));
    setInputM(Math.floor((s % 3600) / 60));
    setInputS(s % 60);
    setSecondsLeft(null);
    setRunning(false);
    setDone(false);
  };

  const display = secondsLeft !== null ? secondsLeft : totalInput;
  const h = Math.floor(display / 3600);
  const m = Math.floor((display % 3600) / 60);
  const s = display % 60;

  const progressFraction = secondsLeft !== null && totalInput > 0 ? secondsLeft / totalInput : 1;
  const R = 90;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - progressFraction);
  const ringColor = done ? "var(--green)" : secondsLeft !== null && secondsLeft <= 10 ? "var(--red)" : "var(--accent)";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Countdown</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Set a deadline. Get an alarm. Stay on track.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p.seconds)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative" style={{ width: 220, height: 220 }}>
          <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle cx="110" cy="110" r={R} fill="none" stroke={ringColor} strokeWidth="10"
              strokeDasharray={circ} strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "none", filter: `drop-shadow(0 0 8px ${ringColor === "var(--accent)" ? "#7c3aed66" : ringColor === "var(--red)" ? "#ef444466" : "#22c55e66"})` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {done ? (
              <div className="text-center">
                <div className="text-4xl mb-1">✓</div>
                <div className="text-sm font-medium" style={{ color: "var(--green)" }}>Done!</div>
              </div>
            ) : (
              <span className="text-5xl font-mono font-bold" style={{ color: secondsLeft !== null && secondsLeft <= 10 ? "var(--red)" : "var(--text)", letterSpacing: -1 }}>
                {`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {secondsLeft === null && !done && (
        <div className="flex items-center justify-center gap-3 mb-6">
          {[
            { label: "H", val: inputH, set: setInputH, max: 23 },
            { label: "M", val: inputM, set: setInputM, max: 59 },
            { label: "S", val: inputS, set: setInputS, max: 59 },
          ].map(({ label, val, set, max }, i) => (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <span className="text-2xl font-mono" style={{ color: "var(--border)" }}>:</span>}
              <div className="text-center">
                <input
                  type="number" min={0} max={max} value={val}
                  onChange={e => set(Math.max(0, Math.min(max, +e.target.value)))}
                  className="w-16 py-2 rounded-xl text-2xl font-mono text-center outline-none"
                  style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
                />
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-3">
        {secondsLeft === null && !done ? (
          <button onClick={start} disabled={totalInput === 0}
            className="px-12 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "var(--accent)", opacity: totalInput === 0 ? 0.4 : 1, boxShadow: "0 0 20px var(--accent-glow)" }}>
            ▶ Start
          </button>
        ) : (
          <>
            <button onClick={reset}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              Reset
            </button>
            {!done && (
              <button onClick={pause}
                className="px-10 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: running ? "var(--red)" : "var(--accent)", minWidth: 130 }}>
                {running ? "⏸ Pause" : "▶ Resume"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
