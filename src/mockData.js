// Mock Data Layer for CAUSA Standalone Mode

const now = Math.floor(Date.now() / 1000);

export const mockAlerts = [
  {
    id: "alert-checkout-high-error-rate",
    origin: "prometheus",
    name: "CheckoutApiHighErrorRate",
    message: "checkout-api HTTP 5xx error rate is above 10% (current: 12.4%)",
    severity: "critical",
    source: {
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "checkout-api-85dbf46687-zxr7z",
        namespace: "causa"
      }
    },
    created_at: now - 300,
    updated_at: now - 30
  },
  {
    id: "alert-order-slow",
    origin: "prometheus",
    name: "OrderServiceLatencyHigh",
    message: "order-service response time is above 1.5s (current: 1.85s)",
    severity: "warning",
    source: {
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "order-service-548b6cdd56-7shql",
        namespace: "causa"
      }
    },
    created_at: now - 360,
    updated_at: now - 30
  },
  {
    id: "alert-payment-timeout",
    origin: "prometheus",
    name: "PaymentServiceTimeout",
    message: "payment-service response time is above 2.5s (current: 3.1s)",
    severity: "critical",
    source: {
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "payment-service-69d586d6c5-pcd4g",
        namespace: "causa"
      }
    },
    created_at: now - 420,
    updated_at: now - 30
  },
  {
    id: "alert-inventory-db-latency",
    origin: "prometheus",
    name: "InventoryDbLatencyHigh",
    message: "Database query latency on inventory-db is above 500ms (current: 820ms)",
    severity: "warning",
    source: {
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "inventory-service-6fcd55bcbf-ds5w9",
        namespace: "causa"
      }
    },
    created_at: now - 600,
    updated_at: now - 60
  }
];

export const mockGraph = {
  nodes: [
    {
      id: "cluster-causa",
      origin: "kubernetes",
      kind: "cluster",
      properties: {
        name: "causa-cluster",
        namespace: "{}"
      }
    },
    {
      id: "node-worker-1",
      origin: "kubernetes",
      kind: "node",
      properties: {
        name: "causa-worker-1",
        namespace: "{}"
      }
    },
    // Pods
    {
      id: "pod-checkout-api",
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "checkout-api-85dbf46687-zxr7z",
        namespace: "causa",
        status: "Running",
        ip: "10.244.1.15",
        cpu_usage: "85%",
        memory_usage: "512Mi"
      }
    },
    {
      id: "pod-order-service",
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "order-service-548b6cdd56-7shql",
        namespace: "causa",
        status: "Running",
        ip: "10.244.1.16",
        cpu_usage: "72%",
        memory_usage: "380Mi"
      }
    },
    {
      id: "pod-payment-service",
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "payment-service-69d586d6c5-pcd4g",
        namespace: "causa",
        status: "Running",
        ip: "10.244.1.17",
        cpu_usage: "95%",
        memory_usage: "256Mi"
      }
    },
    {
      id: "pod-inventory-service",
      origin: "kubernetes",
      kind: "pod",
      properties: {
        name: "inventory-service-6fcd55bcbf-ds5w9",
        namespace: "causa",
        status: "Running",
        ip: "10.244.1.18",
        cpu_usage: "45%",
        memory_usage: "768Mi"
      }
    },
    // Services
    {
      id: "service-checkout-api",
      origin: "kubernetes",
      kind: "service",
      properties: {
        name: "checkout-api",
        namespace: "causa"
      }
    },
    {
      id: "service-order-service",
      origin: "kubernetes",
      kind: "service",
      properties: {
        name: "order-service",
        namespace: "causa"
      }
    },
    {
      id: "service-payment-service",
      origin: "kubernetes",
      kind: "service",
      properties: {
        name: "payment-service",
        namespace: "causa"
      }
    },
    {
      id: "service-inventory-service",
      origin: "kubernetes",
      kind: "service",
      properties: {
        name: "inventory-service",
        namespace: "causa"
      }
    },
    // Alert nodes (these are displayed on the graph)
    {
      id: "alert-checkout-high-error-rate",
      origin: "prometheus",
      kind: "alert",
      properties: {
        name: "CheckoutApiHighErrorRate",
        namespace: "causa",
        message: "checkout-api HTTP 5xx error rate is above 10% (current: 12.4%)",
        severity: "critical"
      }
    },
    {
      id: "alert-order-slow",
      origin: "prometheus",
      kind: "alert",
      properties: {
        name: "OrderServiceLatencyHigh",
        namespace: "causa",
        message: "order-service response time is above 1.5s (current: 1.85s)",
        severity: "warning"
      }
    },
    {
      id: "alert-payment-timeout",
      origin: "prometheus",
      kind: "alert",
      properties: {
        name: "PaymentServiceTimeout",
        namespace: "causa",
        message: "payment-service response time is above 2.5s (current: 3.1s)",
        severity: "critical"
      }
    },
    {
      id: "alert-inventory-db-latency",
      origin: "prometheus",
      kind: "alert",
      properties: {
        name: "InventoryDbLatencyHigh",
        namespace: "causa",
        message: "Database query latency on inventory-db is above 500ms (current: 820ms)",
        severity: "warning"
      }
    }
  ],
  links: [
    // Node containment
    {
      id: "link-node-checkout",
      source: "node-worker-1",
      target: "pod-checkout-api",
      properties: { strength: 1 }
    },
    {
      id: "link-node-order",
      source: "node-worker-1",
      target: "pod-order-service",
      properties: { strength: 1 }
    },
    {
      id: "link-node-payment",
      source: "node-worker-1",
      target: "pod-payment-service",
      properties: { strength: 1 }
    },
    {
      id: "link-node-inventory",
      source: "node-worker-1",
      target: "pod-inventory-service",
      properties: { strength: 1 }
    },
    // Service map
    {
      id: "link-service-checkout",
      source: "service-checkout-api",
      target: "pod-checkout-api",
      properties: { strength: 1 }
    },
    {
      id: "link-service-order",
      source: "service-order-service",
      target: "pod-order-service",
      properties: { strength: 1 }
    },
    {
      id: "link-service-payment",
      source: "service-payment-service",
      target: "pod-payment-service",
      properties: { strength: 1 }
    },
    {
      id: "link-service-inventory",
      source: "service-inventory-service",
      target: "pod-inventory-service",
      properties: { strength: 1 }
    },
    // Communication links
    {
      id: "link-checkout-order",
      source: "pod-checkout-api",
      target: "pod-order-service",
      properties: { strength: 0.95 }
    },
    {
      id: "link-order-payment",
      source: "pod-order-service",
      target: "pod-payment-service",
      properties: { strength: 0.95 }
    },
    {
      id: "link-order-inventory",
      source: "pod-order-service",
      target: "pod-inventory-service",
      properties: { strength: 0.6 }
    },
    // Alert links
    {
      id: "link-alert-checkout",
      source: "alert-checkout-high-error-rate",
      target: "pod-checkout-api",
      properties: { strength: 1 }
    },
    {
      id: "link-alert-order",
      source: "alert-order-slow",
      target: "pod-order-service",
      properties: { strength: 1 }
    },
    {
      id: "link-alert-payment",
      source: "alert-payment-timeout",
      target: "pod-payment-service",
      properties: { strength: 1 }
    },
    {
      id: "link-alert-inventory",
      source: "alert-inventory-db-latency",
      target: "pod-inventory-service",
      properties: { strength: 1 }
    }
  ]
};

// 3 Ranked root-cause analysis trajectories when analyzing alert-checkout-high-error-rate
export const mockRCA = [
  {
    score: 0.95,
    nodes: [
      {
        id: "alert-checkout-high-error-rate",
        origin: "prometheus",
        kind: "alert",
        properties: {
          name: "CheckoutApiHighErrorRate",
          namespace: "causa",
          message: "checkout-api HTTP 5xx error rate is above 10% (current: 12.4%)",
          severity: "critical"
        }
      },
      {
        id: "pod-checkout-api",
        origin: "kubernetes",
        kind: "pod",
        properties: {
          name: "checkout-api-85dbf46687-zxr7z",
          namespace: "causa"
        }
      },
      {
        id: "pod-order-service",
        origin: "kubernetes",
        kind: "pod",
        properties: {
          name: "order-service-548b6cdd56-7shql",
          namespace: "causa"
        }
      },
      {
        id: "pod-payment-service",
        origin: "kubernetes",
        kind: "pod",
        properties: {
          name: "payment-service-69d586d6c5-pcd4g",
          namespace: "causa"
        }
      },
      {
        id: "alert-payment-timeout",
        origin: "prometheus",
        kind: "alert",
        properties: {
          name: "PaymentServiceTimeout",
          namespace: "causa",
          message: "payment-service response time is above 2.5s (current: 3.1s)",
          severity: "critical"
        }
      }
    ],
    links: [
      {
        id: "link-alert-checkout",
        source: "alert-checkout-high-error-rate",
        target: "pod-checkout-api",
        properties: { strength: 1 }
      },
      {
        id: "link-checkout-order",
        source: "pod-checkout-api",
        target: "pod-order-service",
        properties: { strength: 0.95 }
      },
      {
        id: "link-order-payment",
        source: "pod-order-service",
        target: "pod-payment-service",
        properties: { strength: 0.95 }
      },
      {
        id: "link-alert-payment",
        source: "alert-payment-timeout",
        target: "pod-payment-service",
        properties: { strength: 1 }
      }
    ]
  },
  {
    score: 0.65,
    nodes: [
      {
        id: "alert-checkout-high-error-rate",
        origin: "prometheus",
        kind: "alert",
        properties: {
          name: "CheckoutApiHighErrorRate",
          namespace: "causa",
          message: "checkout-api HTTP 5xx error rate is above 10% (current: 12.4%)",
          severity: "critical"
        }
      },
      {
        id: "pod-checkout-api",
        origin: "kubernetes",
        kind: "pod",
        properties: {
          name: "checkout-api-85dbf46687-zxr7z",
          namespace: "causa"
        }
      },
      {
        id: "pod-order-service",
        origin: "kubernetes",
        kind: "pod",
        properties: {
          name: "order-service-548b6cdd56-7shql",
          namespace: "causa"
        }
      },
      {
        id: "pod-inventory-service",
        origin: "kubernetes",
        kind: "pod",
        properties: {
          name: "inventory-service-6fcd55bcbf-ds5w9",
          namespace: "causa"
        }
      },
      {
        id: "alert-inventory-db-latency",
        origin: "prometheus",
        kind: "alert",
        properties: {
          name: "InventoryDbLatencyHigh",
          namespace: "causa",
          message: "Database query latency on inventory-db is above 500ms (current: 820ms)",
          severity: "warning"
        }
      }
    ],
    links: [
      {
        id: "link-alert-checkout",
        source: "alert-checkout-high-error-rate",
        target: "pod-checkout-api",
        properties: { strength: 1 }
      },
      {
        id: "link-checkout-order",
        source: "pod-checkout-api",
        target: "pod-order-service",
        properties: { strength: 0.65 }
      },
      {
        id: "link-order-inventory",
        source: "pod-order-service",
        target: "pod-inventory-service",
        properties: { strength: 0.65 }
      },
      {
        id: "link-alert-inventory",
        source: "alert-inventory-db-latency",
        target: "pod-inventory-service",
        properties: { strength: 1 }
      }
    ]
  },
  {
    score: 0.35,
    nodes: [
      {
        id: "alert-checkout-high-error-rate",
        origin: "prometheus",
        kind: "alert",
        properties: {
          name: "CheckoutApiHighErrorRate",
          namespace: "causa",
          message: "checkout-api HTTP 5xx error rate is above 10% (current: 12.4%)",
          severity: "critical"
        }
      },
      {
        id: "pod-checkout-api",
        origin: "kubernetes",
        kind: "pod",
        properties: {
          name: "checkout-api-85dbf46687-zxr7z",
          namespace: "causa"
        }
      }
    ],
    links: [
      {
        id: "link-alert-checkout",
        source: "alert-checkout-high-error-rate",
        target: "pod-checkout-api",
        properties: { strength: 1 }
      }
    ]
  }
];
