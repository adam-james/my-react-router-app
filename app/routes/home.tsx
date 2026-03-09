import type { Route } from "./+types/home";
import TodoAgent from "../components/todo-agent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo Agent" },
    { name: "description", content: "A conversational todo list agent" },
  ];
}

export default function Home() {
  return <TodoAgent />;
}
