import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default("adaptsec-dev-access-secret-min-32-chars-2026"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default("adaptsec-dev-refresh-secret-min-32-chars-2026"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().default(1025),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().default("AdaptSec Security <noreply@adaptsec.local>"),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("./storage"),
  WEB_URL: z.string().default("http://localhost:3000"),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(): AppEnv {
  return EnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT,
    DATABASE_URL:
      process.env.DATABASE_URL ??
      "postgresql://adaptsec:adaptsec_dev_password@localhost:5432/adaptsec?schema=public",
    REDIS_URL: process.env.REDIS_URL,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    STORAGE_DRIVER: process.env.STORAGE_DRIVER,
    STORAGE_LOCAL_DIR: process.env.STORAGE_LOCAL_DIR,
    WEB_URL: process.env.WEB_URL,
  });
}
