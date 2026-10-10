# CAUSA Frontend (Phase 1)

This is the standalone React frontend for **CAUSA**, an architecture-aware failure diagnosis system for microservices. It is built as a modernized version of `orca-ui`, with OpenRCA-specific branding and backend proxy layers stripped out, and a self-contained, zero-dependency client-side mock data layer implemented.

---

## Project Repositories

CAUSA is split across four repos. This one (frontend) is the entry point — start here.

| Repo | What it is |
|---|---|
| **Causa** (this repo) | React frontend — dashboards, topology graph, RCA views |
| [Causa-backend](https://github.com/Pranjall-Gupta/Causa-backend) | Spring Boot backend — OTLP ingestion, dynamic topology, anomaly detection, heuristic RCA scoring |
| [Causa-test-services](https://github.com/Pranjall-Gupta/Causa-test-services) | Sample microservices used to generate real trace/log/metric data for testing |
| [Causa-plugin-java](https://github.com/soham-kolhe/Causa-plugin-java) | Java plugin developers add to their own services to emit data to CAUSA |

---

## Codebase Map

### Folder Structure
- `/public` - Contains the HTML shell (`index.html`) and favicon.
- `/src` - The core application source files.
  - `/assets` - CSS and SCSS stylesheets defining tables, fonts, variables, and layouts.
  - `/components` - Individual React components making up the interface.
  - `mockData.js` - Contains mock datasets representing 4 microservices, dynamic alerts, and ranked Root Cause Analysis trajectories.
  - `mock.js` - Global Axios request interceptor that routes `/v1/*` requests to the mock dataset.
  - `index.js` - Frontend entry point, rendering the routing layout shell and loading the mock layer.

### Component Map
1. **Layout Shell**:
   - [Navbar.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/Navbar.js) - Rendered at the top of the interface. Displays the application brand (**CAUSA**) and a live badge counting the current active critical/warning incidents.
2. **List & Incident Views**:
   - [Alerts.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/Alerts.js) - Renders the `/alerts` view which lists all active microservice alerts in a paginated, filterable table. Includes severity sorting (Critical > Warning > Info) and direct links to analyze the root causes.
3. **Topology Visualizations**:
   - [Graph.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/Graph.js) - Renders the `/graph` view. It draws an interactive node-link graph of the microservices topology using **D3.js**, complete with zoom/drag controls, namespaces filtering, and status attributes.
   - [GraphUtils.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/GraphUtils.js) - Implements algorithms like namespace filtering, node-kind visibility, and `detectFaultTrajectory` which automatically identifies active fault propagation paths.
   - [NodeDetailCard.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/NodeDetailCard.js) - Displayed as a floating sidebar when clicking a node in the topology graph. Displays raw metadata properties via `react-json-view` and includes the **Analyze** button for alert nodes.
4. **Timeline & RCA Visualizations**:
   - [RCA.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/RCA.js) - Renders the `/rca` view, showing the sub-graph representing the specific root cause trajectory.
   - [Selector.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/Selector.js) - The sidebar rendering the list of ranked paths.
   - [Item.js](file:///c:/Users/A/Desktop/Causa-magic/causa-frontend/src/components/Item.js) - Formats each individual ranked trajectory in the list with its probability score (Weak, Medium, Strong) and source-to-root-cause endpoints.

---

## Standalone Running Instructions

To start the application locally, run these commands inside the `causa-frontend` directory:

```bash
# 1. Navigate to the project directory
cd causa-frontend

# 2. Run the development server
npm start
```

- **Port**: The application runs on **port 3000** (http://localhost:3000) by default.
- **Node Version**: Optimized for **Node.js v22.2.0** and **npm 10.9.3**.
- **OpenSSL Compatibility**: Configured to run with `set NODE_OPTIONS=--openssl-legacy-provider` in `package.json` to handle old Webpack legacy cryptography compatibility on newer Node engines.

---

## Mock Data Layer Design

The frontend intercepts all network calls transparently using `axios.interceptors.request` configured in `src/mock.js`. Instead of sending HTTP requests to the backend host (configured as `http://localhost:5000` in `.env`), the interceptor overrides Axios's network adapter and responds instantly with:
1. **4 Mock Services**: `checkout-api`, `order-service`, `payment-service`, and `inventory-service` (represented as Kubernetes services, pods, and nodes).
2. **Dynamic Timestamps**: Alerts and topology timestamps are dynamically calculated relative to the system's local time (`Date.now()`), so incidents look fresh.
3. **Automatic Fault Highlighting**: Due to the built-in `detectFaultTrajectory` algorithm, if a downstream node (like `payment-service`) and upstream node (like `checkout-api`) both have active alerts, the communication path between them is highlighted in red.
4. **Ranked Trajectories**: Click **Analyze** on `CheckoutApiHighErrorRate` to see three distinct root cause paths scored by likelihood (95% Payment timeout, 65% Inventory database latency, 35% checkout-api local pod resources).

---

## Backend API Specification (Java/Spring Boot)

`Causa-backend` implements the following three endpoints, consumed by this frontend:

### 1. Retrieve Incidents
- **Endpoint**: `GET /v1/alerts`
- **Response Shape**: `Array<Alert>`
```typescript
Array<{
  id: string; // Unique identifier (e.g. "alert-payment-timeout")
  origin: string; // Source monitoring system (e.g. "prometheus", "falco")
  name: string; // Standard alert rule name
  message: string; // Detailed description of the failure event
  severity: "critical" | "warning" | "info" | "Notice"; // Severity label
  source: {
    origin: string | null;
    kind: string | null;
    properties: {
      name: string | null; // Associated component name
      namespace: string;   // K8s namespace or "n/a"
    }
  };
  created_at: number; // Unix timestamp in seconds (seconds since epoch)
  updated_at: number; // Unix timestamp in seconds
}>
```

### 2. Retrieve Architecture Topology
- **Endpoint**: `GET /v1/graph?time_point={timestamp}`
- **Parameters**: `time_point` (optional Unix epoch timestamp in seconds)
- **Response Shape**: `GraphTopology`
```typescript
{
  nodes: Array<{
    id: string; // Unique element ID
    origin: string; // e.g. "kubernetes"
    kind: "cluster" | "node" | "pod" | "service" | "alert" | "deployment" | "config_map" | "secret";
    properties: {
      name: string; // Element name
      namespace: string; // K8s namespace (use "{}" for global resources like node/cluster)
      [key: string]: any; // Any metadata properties rendered in the detail card JSON viewer
    }
  }>;
  links: Array<{
    id: string; // Unique link identifier
    source: string; // Node ID of link origin
    target: string; // Node ID of link destination
    properties: {
      strength?: number; // Integer/Float to render weight/strength on the link
      [key: string]: any;
    }
  }>;
}
```

### 3. Retrieve Root Cause Analysis Trajectories
- **Endpoint**: `GET /v1/rca?source={alert_id}&time_point={timestamp}`
- **Parameters**:
  - `source`: The ID of the alert to analyze (e.g. `alert-checkout-high-error-rate`)
  - `time_point`: The Unix timestamp of when the analysis is requested
- **Response Shape**: `Array<Trajectory>` (Ranked list of paths)
```typescript
Array<{
  score: number; // Probability/strength score (0.0 to 1.0)
  nodes: Array<{
    id: string;
    origin: string;
    kind: string;
    properties: {
      name: string;
      [key: string]: any;
    }
  }>; // Ordered path from manifestation alert [0] to root cause node [length-1]
  links: Array<{
    id: string;
    source: string;
    target: string;
    properties: {
      strength?: number;
      [key: string]: any;
    }
  }>; // Graph links connecting the nodes in the path
}>
```
