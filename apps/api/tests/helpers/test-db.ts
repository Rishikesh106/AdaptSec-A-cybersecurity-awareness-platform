import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import fs from "node:fs/promises";
import path from "node:path";

export interface TestDbContext {
  databaseUrl: string;
  close: () => Promise<void>;
}

export async function startTestPostgres(): Promise<TestDbContext> {
  const db = new PGlite();
  await db.waitReady;

  const migrationPath = path.resolve(
    process.cwd(),
    "../../packages/db/prisma/migrations/0001_init/migration.sql"
  );
  const sql = await fs.readFile(migrationPath, "utf8");
  await db.exec(sql);

  const server = new PGLiteSocketServer({
    db,
    port: 0,
    host: "127.0.0.1",
    maxConnections: 10,
  });
  await server.start();

  const conn = server.getServerConn(); // e.g. 127.0.0.1:xxxxx
  const databaseUrl = `postgresql://postgres:postgres@${conn}/postgres?schema=public&sslmode=disable`;

  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = "test";

  return {
    databaseUrl,
    close: async () => {
      await server.stop();
      await db.close();
    },
  };
}
