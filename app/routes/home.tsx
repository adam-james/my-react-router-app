import type { Route } from "./+types/home";
import Clock from "../clock";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Aurora Clock" },
    { name: "description", content: "A beautiful, creative clock app" },
  ];
}

export default function Home() {
  return <Clock />;
}
