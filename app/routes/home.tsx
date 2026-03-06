import type { Route } from "./+types/home";
import { Calendar } from "../calendar/calendar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Calendar" },
    { name: "description", content: "A simple calendar app" },
  ];
}

export default function Home() {
  return <Calendar />;
}
