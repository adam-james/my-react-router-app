import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("browse", "routes/browse.tsx"),
  route("browse/:commandId", "routes/command-detail.tsx"),
  route("study", "routes/study.tsx"),
  route("quiz", "routes/quiz.tsx"),
] satisfies RouteConfig;
