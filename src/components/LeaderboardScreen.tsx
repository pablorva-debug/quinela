import { Medal } from "lucide-react";
import type { LeaderboardRow, Submission } from "../types";

interface LeaderboardScreenProps {
  rows: LeaderboardRow[];
  submissions: Submission[];
}

export function LeaderboardScreen({ rows, submissions }: LeaderboardScreenProps) {
  return (
    <section className="screen-stack">
      <div className="section-title">
        <Medal aria-hidden="true" size={20} />
        <h2>Leaderboard</h2>
      </div>
      {rows.length === 0 ? (
        <p className="empty-state">Todavía no hay picks enviados.</p>
      ) : (
        <div className="leaderboard">
          {rows.map((row, index) => (
            <article className="leader-row" key={row.playerId}>
              <span className="rank">{index + 1}</span>
              <div>
                <strong>{row.playerName}</strong>
                <p>
                  {row.matchPoints} partidos + {row.podiumPoints} pódium
                </p>
              </div>
              <strong>{row.points}</strong>
            </article>
          ))}
        </div>
      )}
      <p className="fine-print">{submissions.length} participantes enviados.</p>
    </section>
  );
}
