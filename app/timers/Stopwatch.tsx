import { useState, useEffect, useRef } from "react";

function fmt(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const c = Math.floor((ms % 1000) / 10);
  return {
    main: `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`,
    cs: String(c).padStart(2,"0"),
  };
}

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (running) {
      startRef.current = performance.now();
      const tick = () => {
        setElapsed(baseRef.current + (performance.now() - startRef.current));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      baseRef.current = elapsed;
    }
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const toggle = () => setRunning(r => !r);

  const lap = () => {
    if (!running) return;
    setLaps(l => [elapsed, ...l]);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
  };

  const { main, cs } = fmt(elapsed);
  const lapTimes = laps.map((t, i) => ({
    n: laps.length - i,
    total: t,
    split: i === laps.length - 1 ? t : t - laps[i + 1],
  }));
  const fastest = lapTimes.length > 1 ? Math.min(...lapTimes.map(l => l.split)) : -1;
  const slowest = lapTimes.length > 1 ? Math.max(...lapTimes.map(l => l.split)) : -1;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Stopwatch</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Precise to the centisecond. Lap as many times as you need.</p>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-baseline gap-1">
          <span className="font-mono font-bold" style={{ fontSize: 72, color: "var(--text)", letterSpacing: -2 }}>
            {main}
          </span>
          <span className="font-mono font-bold text-3xl" style={{ color: "var(--muted)" }}>
            .{cs}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        <button onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
          Reset
        </button>
        <button onClick={toggle}
          className="px-10 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: running ? "var(--red)" : "var(--accent)", minWidth: 130, boxShadow: running ? "none" : "0 0 20px var(--accent-glow)" }}>
          {running ? "⏸ Stop" : elapsed > 0 ? "▶ Resume" : "▶ Start"}
        </button>
        <button onClick={lap} disabled={!running}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity"
          style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", opacity: running ? 1 : 0.4 }}>
          Lap
        </button>
      </div>

      {laps.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ background: "var(--surface)", color: "var(--muted)" }}>
            <span>Lap</span><span className="text-center">Split</span><span className="text-right">Total</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {lapTimes.map(({ n, total, split }) => {
              const isFastest = lapTimes.length > 1 && split === fastest;
              const isSlowest = lapTimes.length > 1 && split === slowest;
              const color = isFastest ? "var(--green)" : isSlowest ? "var(--red)" : "var(--text)";
              return (
                <div key={n} className="grid grid-cols-3 px-4 py-2.5 text-sm font-mono"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                  <span style={{ color: "var(--muted)" }}>#{n}</span>
                  <span className="text-center" style={{ color }}>{fmt(split).main}.{fmt(split).cs}</span>
                  <span className="text-right" style={{ color: "var(--muted)" }}>{fmt(total).main}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
