import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { loadEnv } from "./config/env.js";
import { errorHandler } from "./lib/errors.js";
import { enforceCsrfOrigin } from "./middleware/auth.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { orgRoutes } from "./routes/orgs.js";

export async function buildApp() {
  const env = loadEnv();

  const app = Fastify({
    logger:
      env.NODE_ENV === "test"
        ? false
        : {
            level: "info",
            redact: ["req.headers.authorization", "req.headers.cookie"],
          },
    trustProxy: true,
  });

  app.setErrorHandler(errorHandler);

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // Swagger UI & API JSON
  });

  // CORS allow-list
  const allowedOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim());
  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });

  await app.register(cookie);

  if (env.NODE_ENV !== "test") {
    await app.register(rateLimit, {
      max: 200,
      timeWindow: "1 minute",
    });
  }

  // OpenAPI / Swagger Docs at /api/docs
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "AdaptSec Enterprise API",
        description:
          "Multi-tenant security awareness, simulation telemetry, adaptive engine, and campaign governance REST API.",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${env.API_PORT}` }],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "adaptsec_access",
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  // CSRF Origin validation on state-changing requests
  app.addHook("onRequest", enforceCsrfOrigin);

  // Root & health routes
  await app.register(healthRoutes);

  // Versioned API v1
  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { prefix: "/auth" });
      await v1.register(orgRoutes);
    },
    { prefix: "/api/v1" }
  );

  return app;
}
