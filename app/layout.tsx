import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevTimer — Pomodoro, Stopwatch & Countdown",
  description: "Three timers every developer needs. Zero fluff.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
