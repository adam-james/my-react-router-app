import type { Route } from "./+types/home";
import { Snowglobe } from "../snowglobe/Snowglobe";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Snowglobe" },
    { name: "description", content: "A fun interactive snowglobe animation" },
  ];
}

export default function Home() {
  return (
    <div className="w-screen h-screen bg-[#050520] overflow-hidden">
      <Snowglobe />
    </div>
  );
}
