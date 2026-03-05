import { useState } from "react";
import type { Route } from "./+types/home";
import { AnalogClock } from "../components/AnalogClock";
import { Stopwatch } from "../components/Stopwatch";
import { Timer } from "../components/Timer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Clock" },
    { name: "description", content: "Clock, Stopwatch & Timer" },
  ];
}

type Tab = "clock" | "stopwatch" | "timer";

export default function Home() {
  const [tab, setTab] = useState<Tab>("clock");

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-950">
      <nav className="flex gap-8 pt-8 pb-6">
        {(["clock", "stopwatch", "timer"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium uppercase tracking-widest ${
              tab === t ? "tab-active" : "tab-inactive"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex items-start justify-center pt-8 sm:pt-16 px-4 w-full">
        {tab === "clock" && <AnalogClock />}
        {tab === "stopwatch" && <Stopwatch />}
        {tab === "timer" && <Timer />}
      </main>
    </div>
  );
}
