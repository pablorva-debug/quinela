import { ListChecks } from "lucide-react";

export function RulesScreen() {
  return (
    <section className="screen-stack">
      <div className="section-title">
        <ListChecks aria-hidden="true" size={20} />
        <h2>Reglas</h2>
      </div>
      <div className="rules-grid">
        <article>
          <strong>Partidos</strong>
          <p>5 pts por ganador o empate. 10 pts si ademas clavas marcador.</p>
        </article>
        <article>
          <strong>Podium</strong>
          <p>30 campeon, 20 subcampeon, 10 tercer lugar.</p>
        </article>
        <article>
          <strong>Abierta</strong>
          <p>Los participantes pueden enviar picks cualquier dia.</p>
        </article>
        <article>
          <strong>Postponed/cancelado</strong>
          <p>No suma ni resta.</p>
        </article>
      </div>
    </section>
  );
}
