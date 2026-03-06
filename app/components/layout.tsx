import { NavLink, Outlet } from "react-router";
import { LeagueProvider, useLeague } from "~/lib/league-context";

function Nav() {
  const { state } = useLeague();
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/teams", label: "Teams" },
    { to: "/schedule", label: "Schedule" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="bowling">
              🎳
            </span>
            <span className="text-white font-bold text-lg hidden sm:block">
              {state.config.name}
            </span>
          </div>
          <div className="flex gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function AppLayout() {
  return (
    <LeagueProvider>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Nav />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </LeagueProvider>
  );
}
