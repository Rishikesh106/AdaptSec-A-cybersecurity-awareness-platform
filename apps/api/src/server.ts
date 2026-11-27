import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { prisma } from "@adaptsec/db";

async function start() {
  const env = loadEnv();
  const app = await buildApp();

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
    app.log.info(`AdaptSec API listening on http://localhost:${env.API_PORT}`);
    app.log.info(`OpenAPI docs at http://localhost:${env.API_PORT}/api/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void start();
