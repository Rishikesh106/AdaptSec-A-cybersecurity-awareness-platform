import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@adaptsec/db";
import type { Role } from "@adaptsec/shared";
import { AppError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/tokens.js";
import { loadEnv } from "../config/env.js";

export interface AuthContext {
  userId: string;
  email: string;
  organizationId: string;
  role: Role;
  department: string;
  sessionId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  // Check httpOnly cookie first, then Authorization Bearer header
  const cookieToken = request.cookies?.adaptsec_access;
  const authHeader = request.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

  const token = cookieToken || bearerToken;
  if (!token) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  let claims;
  try {
    claims = await verifyAccessToken(token);
  } catch {
    throw new AppError(401, "INVALID_TOKEN", "Session expired or invalid");
  }

  const session = await prisma.session.findUnique({
    where: { id: claims.sessionId },
    select: { id: true, revokedAt: true, expiresAt: true, organizationId: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new AppError(401, "SESSION_REVOKED", "Session has been revoked");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: claims.sub,
        organizationId: session.organizationId,
      },
    },
    include: {
      user: { select: { id: true, email: true, deletedAt: true } },
    },
  });

  if (
    !membership ||
    membership.status !== "ACTIVE" ||
    membership.user.deletedAt
  ) {
    throw new AppError(403, "FORBIDDEN", "Active organization membership required");
  }

  request.auth = {
    userId: membership.userId,
    email: membership.user.email,
    organizationId: membership.organizationId,
    role: membership.role as Role,
    department: membership.department,
    sessionId: session.id,
  };
}

export function requireRole(...allowedRoles: Role[]) {
  return async (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> => {
    if (!request.auth) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    if (
      request.auth.role !== "SUPER_ADMIN" &&
      !allowedRoles.includes(request.auth.role)
    ) {
      throw new AppError(
        403,
        "FORBIDDEN",
        `Requires one of roles: ${allowedRoles.join(", ")}`
      );
    }
  };
}

export function enforceCsrfOrigin(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: (err?: Error) => void
) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(request.method)) {
    return done();
  }

  const origin = request.headers.origin;
  if (!origin) {
    // Allow same-origin / non-browser API clients (curl, vitest inject)
    return done();
  }

  const env = loadEnv();
  const allowed = env.CORS_ORIGINS.split(",").map((s) => s.trim());
  if (!allowed.includes(origin)) {
    return done(new AppError(403, "CSRF_BLOCKED", "Untrusted request origin"));
  }
  return done();
}
