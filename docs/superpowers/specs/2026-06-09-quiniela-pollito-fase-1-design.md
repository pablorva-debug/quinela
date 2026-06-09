# Quiniela Pollito 2026 - Fase 1 Design

## Objetivo

Construir la primera version funcional de Quiniela Pollito 2026 como una app web mobile-first en espanol, deployable en Netlify y conectada a Supabase. En esta fase cualquier persona con el link puede entrar, registrar su nombre, llenar predicciones sobre una plantilla cargada de partidos, enviar una vez, y ver un leaderboard publico.

Fase 1 no incluye jalado automatico de resultados desde API. Esa integracion queda reservada para Fase 3.

## Alcance De Fase 1

- App Vite + React + TypeScript.
- Supabase como persistencia remota usando una llave publica configurable.
- Registro simple por nombre, sin login, contrasena ni email.
- Plantilla cargada de 104 partidos con datos editables desde el seed del proyecto.
- Predicciones de marcador exacto para todos los partidos.
- Predicciones de podio inicial: campeon, subcampeon y tercer lugar.
- Sugerencia de podio basada en las predicciones ya capturadas.
- En eliminatorias, seleccion del equipo que avanza.
- Envio unico de predicciones, no editable despues.
- Bloqueo de envio despues del deadline: antes del 11 de junio de 2026.
- Pantalla de resultados con captura manual de resultados oficiales para Fase 1.
- Calculo local y persistido de puntos.
- Leaderboard publico con actualizacion en tiempo real cuando Supabase este configurado.
- Partidos postponed/cancelados ignorados en puntuacion.

## Fuera De Alcance

- Login real, autenticacion social o contrasenas.
- API automatica de resultados.
- Administracion compleja de permisos.
- Calendario real definitivo del Mundial 2026.
- Pagos, invitaciones privadas o ligas multiples.

## Arquitectura

La app sera una SPA de Vite + React. Netlify servira archivos estaticos y redirigira cualquier ruta a `index.html`. Supabase sera consumido directamente desde el cliente con una anon key publica.

Capas principales:

- `src/data/matches.ts`: plantilla local de 104 partidos.
- `src/lib/supabase.ts`: cliente Supabase y modo fallback cuando faltan variables.
- `src/lib/scoring.ts`: reglas puras de puntuacion.
- `src/lib/podium.ts`: sugerencia de podio desde predicciones.
- `src/types.ts`: contratos compartidos.
- `src/App.tsx`: composicion de pantallas y estado.
- `src/components/*`: pantallas, formularios y elementos de UI.

La app debe funcionar en modo demo con `localStorage` si Supabase no esta configurado, para que se pueda revisar la experiencia antes de crear la base de datos. Cuando existan `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, persistira en Supabase.

## Modelo De Datos

Tablas propuestas para Supabase:

### players

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `created_at timestamptz default now()`

### submissions

- `id uuid primary key default gen_random_uuid()`
- `player_id uuid references players(id)`
- `submitted_at timestamptz default now()`
- `locked boolean default true`
- `champion text not null`
- `runner_up text not null`
- `third_place text not null`

### predictions

- `id uuid primary key default gen_random_uuid()`
- `submission_id uuid references submissions(id)`
- `match_id text not null`
- `home_score integer not null`
- `away_score integer not null`
- `advances text`

### results

- `match_id text primary key`
- `home_score integer`
- `away_score integer`
- `winner text`
- `status text not null default 'pending'`
- `updated_at timestamptz default now()`

RLS debe estar habilitado en todas las tablas expuestas. Como la app es publica y sin auth, las politicas permitiran lectura publica, insertar jugadores/predicciones, y no permitiran editar submissions ya enviadas. La captura manual de resultados en Fase 1 sera una herramienta simple con advertencia visual; en produccion se recomienda protegerla fuera de esta fase.

## Experiencia De Usuario

La app abre en una pantalla compacta para ingresar nombre. Despues muestra una experiencia tipo app, no landing page, con navegacion inferior:

- `Predicciones`
- `Leaderboard`
- `Resultados`
- `Reglas`

Predicciones sera la pantalla principal. Debe mostrar progreso, deadline, podio sugerido, podio editable y partidos agrupados por fase. Cada partido usa controles compactos para marcador y, si es eliminatoria, un selector claro de quien avanza. El boton de enviar permanece deshabilitado hasta completar todo.

Despues de enviar, la app muestra estado bloqueado, resumen de picks y acceso directo al leaderboard. La copia debe ser breve, en espanol mexicano natural, sin instrucciones largas dentro de la interfaz.

## Direccion Visual

Mobile-first, clara y moderna. El estilo debe sentirse como una quiniela de amigos bien hecha: deportiva, ordenada, rapida de llenar, con personalidad sin sacrificar escaneabilidad.

Principios:

- Layout denso pero respirable.
- Navegacion inferior fija en mobile.
- Cards solo para partidos, bloques repetidos y estados concretos.
- Jerarquia fuerte para fase, equipos, marcador y progreso.
- Controles tactiles grandes y predecibles.
- Paleta equilibrada, no monotono azul/morado ni beige.
- Tipografia legible con una fuente de display moderada para titulos y una fuente de lectura clara.
- Estados visibles para pendiente, completo, bloqueado, enviado, cancelado y postponed.

## Flujo De Datos

1. Usuario escribe nombre.
2. App crea o recupera jugador por nombre en Supabase o fallback local.
3. Usuario llena 104 predicciones y podio.
4. App calcula podio sugerido en vivo.
5. Usuario envia.
6. App crea `submission` y `predictions`.
7. App bloquea edicion localmente y por datos persistidos.
8. Leaderboard combina submissions, predictions y results para calcular puntos.
9. Realtime refresca leaderboard y resultados si Supabase esta activo.

## Puntuacion

Por partido:

- 0 puntos si falla ganador o empate.
- 5 puntos si acierta ganador o empate.
- 10 puntos si acierta ganador o empate y marcador exacto.

Podio:

- 30 puntos por campeon acertado.
- 20 puntos por subcampeon acertado.
- 10 puntos por tercer lugar acertado.

Partidos con estado `postponed` o `cancelled` no suman ni restan.

## Deadline

El deadline de envio es antes del 11 de junio de 2026. La implementacion usara `2026-06-11T00:00:00` en la zona horaria local del navegador para Fase 1, con texto visible que diga "Cierra el 11 de junio de 2026".

## Manejo De Errores

- Si falta configuracion de Supabase, la app entra en modo demo local.
- Si falla una escritura, se muestra mensaje breve y se permite reintentar.
- Si una prediccion esta incompleta, el boton de envio explica que falta terminar.
- Si el deadline paso, se bloquea envio y se mantiene lectura.
- Si hay datos corruptos o incompletos en resultados, el partido se ignora para puntuacion.

## Verificacion

Antes de cerrar Fase 1:

- `npm run build` debe pasar.
- Las reglas de puntuacion deben tener pruebas unitarias.
- La app debe abrir en desktop y mobile.
- Se debe verificar que la plantilla contiene 104 partidos.
- Se debe verificar que no se pueda enviar con predicciones incompletas.
- Se debe verificar que un envio queda bloqueado.
- Se debe verificar que el leaderboard calcula puntos con resultados manuales.

