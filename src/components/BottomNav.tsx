import { BarChart3, ClipboardList, ListChecks, Trophy } from "lucide-react";

export type Tab = "predictions" | "leaderboard" | "results" | "rules";

const tabs = [
  { id: "predictions" as const, label: "Picks", icon: ClipboardList },
  { id: "leaderboard" as const, label: "Tabla", icon: Trophy },
  { id: "results" as const, label: "Resultados", icon: BarChart3 },
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
