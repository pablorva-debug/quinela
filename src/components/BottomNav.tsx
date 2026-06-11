import { BarChart3, ClipboardList, ListChecks, Trophy, UsersRound } from "lucide-react";

export type Tab = "predictions" | "leaderboard" | "gamePredictions" | "results" | "rules";

const tabs = [
  { id: "predictions" as const, label: "Picks", icon: ClipboardList },
  { id: "leaderboard" as const, label: "Tabla", icon: Trophy },
  { id: "gamePredictions" as const, label: "Juegos", icon: UsersRound },
  { id: "results" as const, label: "Result.", icon: BarChart3 },
  { id: "rules" as const, label: "Reglas", icon: ListChecks }
];

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          className={activeTab === id ? "nav-item active" : "nav-item"}
          key={id}
          type="button"
          onClick={() => onChange(id)}
        >
          <Icon aria-hidden="true" size={20} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
