import { ListChecks } from "lucide-react";

interface RulesScreenProps {
  deadline: Date;
}

export function RulesScreen({ deadline }: RulesScreenProps) {
  return (
    <section className="screen-stack">
      <div className="section-title">
        <ListChecks aria-hidden="true" size={20} />
        <h2>Reglas</h2>
      </div>
      <div className="rules-grid">
        <article>
          <strong>Partidos</strong>
          <p>5 pts por ganador o empate. 10 pts si además clavas marcador.</p>
        </article>
        <article>
          <strong>Pódium</strong>
          <p>30 campeón, 20 subcampeón, 10 tercer lugar.</p>
        </article>
        <article>
          <strong>Cierre</strong>
          <p>{deadline.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}.</p>
        </article>
        <article>
          <strong>Postponed/cancelado</strong>
          <p>No suma ni resta.</p>
        </article>
      </div>
    </section>
  );
}
