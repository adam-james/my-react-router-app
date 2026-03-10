import type { Route } from "./+types/home";
import { Blackjack } from "../blackjack/blackjack";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blackjack" },
    { name: "description", content: "Classic blackjack card game" },
  ];
}

export default function Home() {
  return <Blackjack />;
}
