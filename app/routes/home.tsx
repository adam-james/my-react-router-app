import type { Route } from "./+types/home";
import { Blackjack } from "../blackjack/blackjack";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sunset Blackjack" },
    { name: "description", content: "A blackjack game with sunset vibes" },
  ];
}

export default function Home() {
  return <Blackjack />;
}
