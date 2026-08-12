# CAUSA Frontend (Phase 1) Implementation & Walkthrough Guide

This document is created to guide developers and AI coding agents working on subsequent phases of **CAUSA** (e.g. backend integration in Spring Boot). It outlines what was changed, how the mocking is structured, and how the interface behaves.

---

## 1. Project Overview & Phase 1 Scope
The goal of Phase 1 was to take the open-source `orca-ui` project and turn it into a standalone mock-enabled frontend for **CAUSA**, a microservice failure diagnosis system. 

- **Language & Framework**: React (v16.13) + D3.js (v5.16) for graph visualization.
- **Dependency Migration**: Replaced the native binary `node-sass` with pure-JS `sass` in `package.json` to enable compilation on Node v22 without C++ binding compilation errors.
- **Port**: Runs on **port 3000** (`npm start`).
- **OpenSSL Compatibility**: Configured to run with `set NODE_OPTIONS=--openssl-legacy-provider` in `package.json` scripts to allow Webpack (v4) to run on Node v22.

---

## 2. Codebase Map
- `/public` - Contains the HTML shell (`index.html`).
- `/src/components` - Visual layout and dashboard parts:
  - `Navbar.js` - Top header showing **CAUSA** branding and the current active incident count.
  - `Alerts.js` - Table listing the 4 active mock incidents.
  - `Graph.js` - D3 topology visualization mapping services, pods, and alert nodes.
  - `GraphUtils.js` - Core topology filters. Contains `detectFaultTrajectory()` which automatically marks links as red "fault paths" if they connect services that both have active alerts.
  - `NodeDetailCard.js` - Sidebar panel displaying raw JSON info. Shows an **Analyze** button when clicking on alert nodes.
  - `RCA.js` - Renders the root-cause trajectory sub-graph.
  - `Selector.js` & `Item.js` - Renders the left sidebar list of ranked root cause paths.

---

## 3. Mock Data Layer Architecture
To avoid running a backend during this phase, an Axios interceptor was implemented.

* **Files Added**:
  - `src/mockData.js`: Defines realistic topology node/link configurations and dynamic alerts.
  - `src/mock.js`: Configures the Axios request interceptor (`axios.interceptors.request.use`).
* **How It Works**:
  - `index.js` imports `./mock` at the very top.
  - The interceptor captures any requests directed to `/v1/alerts`, `/v1/graph`, or `/v1/rca`.
  - It replaces the default network adapter (`config.adapter`) with a function returning a resolved promise with the mock data, bypassing any physical HTTP requests to `localhost:5000`.

### Incidents Mocked
1. `CheckoutApiHighErrorRate` (Critical)
2. `OrderServiceLatencyHigh` (Warning)
3. `PaymentServiceTimeout` (Critical)
4. `InventoryDbLatencyHigh` (Warning)

### Fault Path Propagation Simulation
The alerts are set up on `checkout-api`, `order-service`, and `payment-service`. The D3 graph code automatically detects this sequence and colors the connections **Checkout -> Order** and **Order -> Payment** in red to show fault propagation.

---

## 4. Backend API Contract (For Phase 2)
Any future backend (e.g. Java / Spring Boot) must satisfy this spec:

### GET `/v1/alerts`
Returns a list of active incidents.
```json
[
  {
    "id": "alert-checkout-high-error-rate",
    "origin": "prometheus",
    "name": "CheckoutApiHighErrorRate",
    "message": "checkout-api HTTP 5xx error rate is above 10%",
    "severity": "critical",
    "source": {
      "origin": "kubernetes",
      "kind": "pod",
      "properties": { "name": "checkout-api-85dbf46687-zxr7z", "namespace": "causa" }
    },
    "created_at": 1782293371,
    "updated_at": 1782293641
  }
]
```

### GET `/v1/graph?time_point={timestamp}`
Returns the full network topology at that timestamp.
```json
{
  "nodes": [
    {
      "id": "pod-checkout-api",
      "origin": "kubernetes",
      "kind": "pod",
      "properties": { "name": "checkout-api-85dbf46687-zxr7z", "namespace": "causa", "cpu": "85%" }
    }
  ],
  "links": [
    {
      "id": "link-checkout-order",
      "source": "pod-checkout-api",
      "target": "pod-order-service",
      "properties": { "strength": 0.95 }
    }
  ]
}
```

### GET `/v1/rca?source={alert_id}&time_point={timestamp}`
Returns ranked lists of root causes explaining the alert.
```json
[
  {
    "score": 0.95,
    "nodes": [
      { "id": "alert-checkout-high-error-rate", "kind": "alert", "properties": { "name": "CheckoutApiHighErrorRate" } },
      { "id": "pod-checkout-api", "kind": "pod", "properties": { "name": "checkout-api-pod" } },
      { "id": "pod-order-service", "kind": "pod", "properties": { "name": "order-service-pod" } },
      { "id": "pod-payment-service", "kind": "pod", "properties": { "name": "payment-service-pod" } },
      { "id": "alert-payment-timeout", "kind": "alert", "properties": { "name": "PaymentServiceTimeout" } }
    ],
    "links": [
      { "id": "link-alert-checkout", "source": "alert-checkout-high-error-rate", "target": "pod-checkout-api" },
      { "id": "link-checkout-order", "source": "pod-checkout-api", "target": "pod-order-service" },
      { "id": "link-order-payment", "source": "pod-order-service", "target": "pod-payment-service" },
      { "id": "link-alert-payment", "source": "alert-payment-timeout", "target": "pod-payment-service" }
    ]
  }
]
```

---

## 5. Mock Mode Toggle & Runtime Configuration

### Dynamic Mock Interceptor Control
- **Previous Behavior**: The application previously imported `src/mock.js` unconditionally at startup in `index.js`, permanently hijacking all HTTP requests to `/v1/alerts`, `/v1/graph`, and `/v1/rca` with hardcoded mock data regardless of backend availability.
- **Current Behavior**: Mocking is now controlled dynamically via the `REACT_APP_USE_MOCK` environment variable in `.env`:
  - `REACT_APP_USE_MOCK=true`: `src/mock.js` is loaded via `require('./mock')`, intercepting requests to `/v1/alerts`, `/v1/graph`, and `/v1/rca`.
  - `REACT_APP_USE_MOCK=false` (or unset): Mocking is disabled, allowing real HTTP requests to be routed directly to the Spring Boot backend configured via `REACT_APP_BACKEND_HOST`.
- **Developer Reference (`.env.example`)**: A `.env.example` file is included to document the `REACT_APP_USE_MOCK` flag and backend configuration for other developers.

### ESLint `import/first` Resolution
- **Rule Requirement**: Create React App enforces ESLint's `import/first` rule, requiring all static ES module `import` statements to be placed at the very top of the module file before any executable statements or conditional logic.
- **Implementation**: In `index.js`, all static `import ... from ...` statements are placed at the top of the file in their original order, followed immediately by the conditional `if (process.env.REACT_APP_USE_MOCK === 'true') { require('./mock'); }` block prior to any application rendering logic (`ReactDOM.render`).
