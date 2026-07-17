# CAUSA Frontend

React + TypeScript + Vite dashboard for the CAUSA failure diagnosis backend.
Layout and color theme are matched directly to the reference dashboard screenshot
(dark near-black background, green accent system, sidebar nav, stat cards with
sparklines, bar-chart timeline, table, side widget) — restyled around request
tracing data instead of the original eco-metrics.

## Run it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. Talks to the backend at `http://localhost:8080`
by default — copy `.env.example` to `.env` and change `VITE_API_URL` if needed.

If the backend isn't running, the dashboard falls back to `src/data/mockData.ts`
so you can keep building/styling the UI independently.

## Structure

- `src/components/` — `Sidebar`, `StatCard`, `FailureTimelineChart`,
  `RequestVolumePanel`, `ServiceHealthTable`, `RequestFlowWidget`
- `src/pages/Dashboard.tsx` — assembles everything, polls `/api/dashboard/summary`
  every 8s, has a "Simulate Traffic" button that calls `POST /api/simulate/burst/15`
- `src/api/client.ts` — thin fetch wrapper over the backend REST API
- `src/styles/theme.css` — all the CSS variables for the color system (`--bg-app`,
  `--accent-green`, etc.) — change these in one place to retheme everything

## Next steps (Week 3+ of the roadmap)

1. Trace detail page: click a row → waterfall view of spans (a horizontal Gantt-style
   bar per span, indented by parent/child) + the `Diagnosis` explanation panel.
2. Replace 8s polling with a WebSocket/SSE stream once the backend pushes live spans.
3. A "Traces" list page (the sidebar nav item is already there, just not wired up).
