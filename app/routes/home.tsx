import type { Route } from "./+types/home";
import TicTacToe from "../game/tic-tac-toe";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sunset Tic Tac Toe" },
    { name: "description", content: "A beautiful sunset-themed tic-tac-toe game" },
  ];
}

export default function Home() {
  return <TicTacToe />;
}
