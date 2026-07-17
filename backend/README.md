# CAUSA Backend

Architecture-aware, multi-layer failure diagnosis system — Spring Boot service.

## What's in here

- **Tracing model** (`model/Span.java`, `model/Trace.java`) — a `Trace` is one end-to-end
  request; `Span`s are the individual hops through `api-gateway → auth-service →
  order-service → payment-service → database`, linked by `parentSpanId` like an
  OpenTelemetry span tree.
- **SimulationEngine** — generates realistic traces for 6 scenarios (`SUCCESS`,
  `DB_TIMEOUT`, `AUTH_FAILURE`, `PAYMENT_ERROR`, `HIGH_LATENCY`, `CASCADING_FAILURE`).
  This stands in for real instrumented services — swap it out once you have actual
  microservices pushing spans in.
- **RootCauseEngine** — the diagnosis core. Rule-based scorer, not ML: weighs error
  presence, "deepest failing node" (origin vs. propagation), and latency contribution.
  Every span's score + reasoning is returned, not just the final verdict — see
  `RootCauseEngine.java` for the exact weights and the reasoning in the comments.
- **DashboardService** — aggregates the last 50 traces into the numbers the frontend renders.

## Run it

```bash
./mvnw spring-boot:run
```

Starts on `http://localhost:8080`, seeds ~40 fake traces on boot (see
`BackendApplication.seedData`), and uses an in-memory H2 database (console at
`/h2-console`, JDBC URL `jdbc:h2:mem:causa`).

## API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/simulate/{scenario}` | POST | Trigger one specific scenario (e.g. `db_timeout`) |
| `/api/simulate/random` | POST | Trigger one randomly-weighted scenario |
| `/api/simulate/burst/{count}` | POST | Generate `count` random traces at once |
| `/api/traces` | GET | Last 50 traces |
| `/api/traces/{requestId}` | GET | Full span list for one trace |
| `/api/traces/{requestId}/diagnosis` | GET | Run/re-run root cause analysis on a trace |
| `/api/dashboard/summary` | GET | Aggregate stats for the dashboard UI |

## Next steps (Week 2+ of the roadmap)

1. Swap H2 for Postgres before deploying (add `application-prod.properties` +
   `spring-boot-starter-data-jpa` already covers the driver — just add
   `org.postgresql:postgresql` to `pom.xml`).
2. Replace `SimulationEngine` with a real ingestion endpoint (`POST /api/spans`) once
   you have actual services to instrument, or keep both side by side for demos.
3. Add a baseline-deviation signal to `RootCauseEngine` (compare a span's latency to
   its own historical p95, not just its share of the current trace) — this is the
   natural next increment beyond the pure rule-based version.
