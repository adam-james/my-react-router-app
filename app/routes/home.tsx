import type { Route } from "./+types/home";
import AlarmClock from "../components/alarm-clock";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sunrise Alarm Clock" },
    { name: "description", content: "A beautiful alarm clock with a sunrise vibe" },
  ];
}

export default function Home() {
  return <AlarmClock />;
}
