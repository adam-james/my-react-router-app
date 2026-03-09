import type { Route } from "./+types/home";
import { DayPlanner } from "../planner/day-planner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Today — Day Planner" },
    {
      name: "description",
      content: "Focus on what matters most today.",
    },
  ];
}

export default function Home() {
  return <DayPlanner />;
}
