import type { Route } from "./+types/home";
import BlackjackGame from "../blackjack/game";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blackjack | Ocean Breeze Casino" },
    { name: "description", content: "A chill blackjack game with ocean vibes" },
  ];
}

export default function Home() {
  return <BlackjackGame />;
}
