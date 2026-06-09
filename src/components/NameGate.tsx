import { FormEvent, useState } from "react";
import { Drumstick } from "lucide-react";

interface NameGateProps {
  busy: boolean;
  message: string;
  mode: "supabase" | "demo";
  onSubmit: (name: string) => void;
}

export function NameGate({ busy, message, mode, onSubmit }: NameGateProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim()) {
      onSubmit(name);
    }
  }

  return (
    <main className="entry-shell">
      <form className="entry-panel" onSubmit={handleSubmit}>
        <div className="brand-mark">
          <Drumstick aria-hidden="true" size={28} />
        </div>
        <p className="eyebrow">Quiniela Pollito 2026</p>
        <h1>Entra con tu nombre.</h1>
        <label className="field-label" htmlFor="player-name">
          Nombre
        </label>
        <input
          autoComplete="name"
          id="player-name"
          maxLength={80}
          placeholder="Ej. Pablo"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="primary-button" disabled={!name.trim() || busy} type="submit">
          {busy ? "Entrando..." : "Entrar"}
        </button>
        <p className="fine-print">{mode === "supabase" ? "Conectado a Supabase." : "Modo demo local."}</p>
        {message ? <p className="form-error">{message}</p> : null}
      </form>
    </main>
  );
}
