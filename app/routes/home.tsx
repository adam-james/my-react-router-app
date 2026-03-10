import type { Route } from "./+types/home";
import { AdventCalendar } from "../components/advent-calendar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Advent Calendar" },
    {
      name: "description",
      content: "A festive advent calendar — open a new door each day in December!",
    },
  ];
}

export default function Home() {
  return <AdventCalendar />;
}
