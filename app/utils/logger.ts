import pino from "pino";
import type { LokiOptions } from "pino-loki";
import client from "prom-client";
import http from "http";

const isProduction = process.env.NODE_ENV === "production";

// Configuration for pushing to Loki
const transport = pino.transport<LokiOptions>({
  target: "pino-loki",
  options: {
    host: process.env.LOKI_HOST || "http://localhost:3100",
    labels: { application: "node_a-lex" }, // Base label for all logs
    // basicAuth: {
    //   username: "username",
    //   password: "password",
    // },
  },
});

export const logger = pino(
  {
    level: "info",
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    // Adding standard metadata
    base: {
      env: process.env.NODE_ENV,
      service: "frontend-api",
    },
  },
  isProduction ? transport : undefined, // Use Loki transport in production, console in development
);

// Configuration for pushing to Prometheus
const register = new client.Registry();

  const gateway = new client.Pushgateway(
    process.env.PUSHGATEWAY_URL!,
    {
      timeout: 5000, //Set the request timeout to 5000ms
      agent: new http.Agent({
        keepAlive: true,
        maxSockets: 5,
      }),
    },
    isProduction ? register : undefined, // Only use the registry in production
  );

  // pushes every 5 seconds to Prometheus Pushgateway
  setInterval(async () => {
    try {
      await gateway.push({ jobName: "node_a-lex" });
    } catch (err) {
      // do nothing
    }
  }, 5000);

// creates histogram for distribution value (like time) with Prometheus
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

client.collectDefaultMetrics({ register });
export { register };
