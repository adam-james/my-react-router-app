import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("teams", "routes/teams.tsx"),
  route("schedule", "routes/schedule.tsx"),
  route("standings", "routes/standings.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
