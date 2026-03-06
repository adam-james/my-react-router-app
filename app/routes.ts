import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/layout.tsx", [
    index("routes/home.tsx"),
    route("teams", "routes/teams.tsx"),
    route("schedule", "routes/schedule.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
