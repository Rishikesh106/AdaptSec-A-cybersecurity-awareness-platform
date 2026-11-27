import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { loadEnv } from "../config/env.js";
import type { Role } from "@adaptsec/shared";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  orgId: string;
  role: Role;
  sessionId: string;
}

export function hashOpaqueToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateOpaqueToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function signAccessToken(
  payload: AccessTokenPayload
): Promise<string> {
  const env = loadEnv();
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
  return new SignJWT({
    email: payload.email,
    orgId: payload.orgId,
    role: payload.role,
    sessionId: payload.sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const env = loadEnv();
  const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
  const { payload } = await jwtVerify(token, secret);

  if (
    !payload.sub ||
    typeof payload.email !== "string" ||
    typeof payload.orgId !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.sessionId !== "string"
  ) {
    throw new Error("Invalid access token claims");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    orgId: payload.orgId,
    role: payload.role as Role,
    sessionId: payload.sessionId,
  };
}
