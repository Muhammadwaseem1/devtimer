"use client";
import { useState } from "react";
import Pomodoro from "./timers/Pomodoro";
import Stopwatch from "./timers/Stopwatch";
import Countdown from "./timers/Countdown";

const TABS = [
  { id: "pomodoro",  label: "Pomodoro",   icon: "🍅" },
  { id: "stopwatch", label: "Stopwatch",  icon: "⏱" },
  { id: "countdown", label: "Countdown",  icon: "⏳" },
] as const;
type TabId = typeof TABS[number]["id"];

export default function Home() {
  const [active, setActive] = useState<TabId>("pomodoro");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⏰</span>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--text)" }}>DevTimer</span>
          <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            v1.0
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--muted)" }}>Three timers. Zero fluff.</span>
      </header>

      <nav className="px-6 pt-5 pb-0 flex gap-1" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-xl transition-colors relative"
            style={{
              background: active === tab.id ? "var(--surface)" : "transparent",
              color: active === tab.id ? "var(--text)" : "var(--muted)",
              borderTop: active === tab.id ? "1px solid var(--border)" : "1px solid transparent",
              borderLeft: active === tab.id ? "1px solid var(--border)" : "1px solid transparent",
              borderRight: active === tab.id ? "1px solid var(--border)" : "1px solid transparent",
              borderBottom: active === tab.id ? "1px solid var(--surface)" : "1px solid transparent",
              marginBottom: active === tab.id ? -1 : 0,
            }}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6" style={{ background: "var(--bg)" }}>
        <div className="max-w-2xl mx-auto">
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: "2rem", border: "1px solid var(--border)" }}>
            <div style={{ display: active === "pomodoro"  ? "block" : "none" }}><Pomodoro /></div>
            <div style={{ display: active === "stopwatch" ? "block" : "none" }}><Stopwatch /></div>
            <div style={{ display: active === "countdown" ? "block" : "none" }}><Countdown /></div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs py-3" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
        DevTimer — built for devs who ship
      </footer>
    </div>
  );
}
