import type { Route } from "./+types/home";
import { Stopwatch } from "../stopwatch";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stopwatch" },
    { name: "description", content: "A simple, beautiful stopwatch app." },
  ];
}

export default function Home() {
  return <Stopwatch />;
}
