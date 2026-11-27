import type { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { prisma } from "@adaptsec/db";
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@adaptsec/shared";
import { AppError } from "../lib/errors.js";
import {
  generateOpaqueToken,
  hashOpaqueToken,
  signAccessToken,
} from "../lib/tokens.js";
import { requireAuth } from "../middleware/auth.js";
import { recordAuditLog } from "../lib/audit.js";
import { emailAdapter } from "../lib/email.js";
import { loadEnv } from "../config/env.js";
import { z } from "zod";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function setAuthCookies(
  reply: any,
  accessToken: string,
  refreshToken: string
) {
  const isProd = process.env.NODE_ENV === "production";
  reply.setCookie("adaptsec_access", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 15 * 60,
  });
  reply.setCookie("adaptsec_refresh", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/api/v1/auth",
    maxAge: 7 * 24 * 60 * 60,
  });
}

function clearAuthCookies(reply: any) {
  reply.clearCookie("adaptsec_access", { path: "/" });
  reply.clearCookie("adaptsec_refresh", { path: "/api/v1/auth" });
}

export async function authRoutes(app: FastifyInstance) {
  // POST /api/v1/auth/register
  app.post("/register", async (request, reply) => {
    const body = RegisterSchema.parse(request.body);
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");
    }

    const passwordHash = await argon2.hash(body.password, {
      type: argon2.argon2id,
    });

    const orgName = body.organizationName?.trim() || `${body.name}'s Organization`;
    const orgSlug =
      orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      generateOpaqueToken(3);

    const verificationToken = generateOpaqueToken(24);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          name: body.name.trim(),
          passwordHash,
          emailVerified: false,
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "ORG_ADMIN",
          department: body.department,
          status: "ACTIVE",
        },
      });

      await tx.verificationToken.create({
        data: {
          userId: user.id,
          tokenHash: hashOpaqueToken(verificationToken),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const refreshToken = generateOpaqueToken(32);
      const session = await tx.session.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          refreshTokenHash: hashOpaqueToken(refreshToken),
          userAgent: request.headers["user-agent"] ?? null,
          ipAddress: request.ip,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return { org, user, membership, session, refreshToken };
    });

    const accessToken = await signAccessToken({
      sub: result.user.id,
      email: result.user.email,
      orgId: result.org.id,
      role: "ORG_ADMIN",
      sessionId: result.session.id,
    });

    setAuthCookies(reply, accessToken, result.refreshToken);

    const env = loadEnv();
    await emailAdapter.send({
      to: result.user.email,
      subject: "Verify your AdaptSec email address",
      html: `<p>Hello ${result.user.name},</p><p>Verify your email by opening: <a href="${env.WEB_URL}/verify-email?token=${verificationToken}">Verify Email</a></p>`,
    });

    await recordAuditLog({
      organizationId: result.org.id,
      actorId: result.user.id,
      action: "USER_REGISTERED",
      targetType: "User",
      targetId: result.user.id,
      ipAddress: request.ip,
    });

    return reply.status(201).send({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        emailVerified: result.user.emailVerified,
        activeOrganizationId: result.org.id,
        activeOrganizationName: result.org.name,
        activeRole: result.membership.role,
        department: result.membership.department,
      },
      // Returned in dev/test only for verification flow testing
      ...(process.env.NODE_ENV !== "production"
        ? { devVerificationToken: verificationToken }
        : {}),
    });
  });

  // POST /api/v1/auth/login
  app.post("/login", async (request, reply) => {
    const body = LoginSchema.parse(request.body);
    const email = body.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { organization: true },
        },
      },
    });

    if (!user || !user.passwordHash || user.deletedAt) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(
        423,
        "ACCOUNT_LOCKED",
        "Account temporarily locked due to repeated failed login attempts. Try again later."
      );
    }

    const valid = await argon2.verify(user.passwordHash, body.password);
    if (!valid) {
      const nextFails = user.failedLoginAttempts + 1;
      const shouldLock = nextFails >= MAX_FAILED_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextFails,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
            : null,
        },
      });
      await recordAuditLog({
        actorId: user.id,
        action: shouldLock ? "LOGIN_LOCKOUT" : "LOGIN_FAILED",
        targetType: "User",
        targetId: user.id,
        ipAddress: request.ip,
      });
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const activeMembership = user.memberships[0];
    if (!activeMembership) {
      throw new AppError(403, "NO_ACTIVE_ORG", "No active organization membership found");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastActiveAt: new Date(),
      },
    });

    const refreshToken = generateOpaqueToken(32);
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        organizationId: activeMembership.organizationId,
        refreshTokenHash: hashOpaqueToken(refreshToken),
        userAgent: request.headers["user-agent"] ?? null,
        ipAddress: request.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      orgId: activeMembership.organizationId,
      role: activeMembership.role as any,
      sessionId: session.id,
    });

    setAuthCookies(reply, accessToken, refreshToken);

    await recordAuditLog({
      organizationId: activeMembership.organizationId,
      actorId: user.id,
      action: "LOGIN_SUCCESS",
      targetType: "Session",
      targetId: session.id,
      ipAddress: request.ip,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        xp: user.xp,
        streakDays: user.streakDays,
        activeOrganizationId: activeMembership.organizationId,
        activeOrganizationName: activeMembership.organization.name,
        activeRole: activeMembership.role,
        department: activeMembership.department,
        memberships: user.memberships.map((m) => ({
          organizationId: m.organizationId,
          organizationName: m.organization.name,
          organizationSlug: m.organization.slug,
          role: m.role,
          department: m.department,
        })),
      },
    });
  });

  // POST /api/v1/auth/refresh
  app.post("/refresh", async (request, reply) => {
    const refreshToken = request.cookies?.adaptsec_refresh;
    if (!refreshToken) {
      throw new AppError(401, "NO_REFRESH_TOKEN", "Refresh token missing");
    }

    const tokenHash = hashOpaqueToken(refreshToken);
    const session = await prisma.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      clearAuthCookies(reply);
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token invalid or expired");
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.userId,
          organizationId: session.organizationId,
        },
      },
    });

    if (!membership || membership.status !== "ACTIVE") {
      throw new AppError(403, "FORBIDDEN", "Membership is not active");
    }

    const nextRefresh = generateOpaqueToken(32);
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashOpaqueToken(nextRefresh),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = await signAccessToken({
      sub: session.userId,
      email: session.user.email,
      orgId: session.organizationId,
      role: membership.role as any,
      sessionId: session.id,
    });

    setAuthCookies(reply, accessToken, nextRefresh);
    return reply.send({ ok: true });
  });

  // POST /api/v1/auth/logout
  app.post("/logout", { preHandler: [requireAuth] }, async (request, reply) => {
    if (request.auth?.sessionId) {
      await prisma.session.update({
        where: { id: request.auth.sessionId },
        data: { revokedAt: new Date() },
      });
    }
    clearAuthCookies(reply);
    return reply.send({ ok: true });
  });

  // POST /api/v1/auth/verify-email
  app.post("/verify-email", async (request, reply) => {
    const body = VerifyEmailSchema.parse(request.body);
    const tokenHash = hashOpaqueToken(body.token);

    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError(400, "INVALID_TOKEN", "Verification token is invalid or expired");
    }

    await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
    ]);

    return reply.send({ verified: true });
  });

  // POST /api/v1/auth/forgot-password
  app.post("/forgot-password", async (request, reply) => {
    const body = ForgotPasswordSchema.parse(request.body);
    const email = body.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    let devResetToken: string | undefined;
    if (user && !user.deletedAt) {
      const resetToken = generateOpaqueToken(24);
      devResetToken = resetToken;
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashOpaqueToken(resetToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      const env = loadEnv();
      await emailAdapter.send({
        to: user.email,
        subject: "Reset your AdaptSec password",
        html: `<p>Reset your password here: <a href="${env.WEB_URL}/reset-password?token=${resetToken}">Reset Password</a></p>`,
      });
    }

    return reply.send({
      message: "If an account exists for this email, reset instructions have been sent.",
      ...(process.env.NODE_ENV !== "production" && devResetToken
        ? { devResetToken }
        : {}),
    });
  });

  // POST /api/v1/auth/reset-password
  app.post("/reset-password", async (request, reply) => {
    const body = ResetPasswordSchema.parse(request.body);
    const tokenHash = hashOpaqueToken(body.token);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError(400, "INVALID_TOKEN", "Password reset token is invalid or expired");
    }

    const passwordHash = await argon2.hash(body.password, {
      type: argon2.argon2id,
    });

    await prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return reply.send({ reset: true });
  });

  // GET /api/v1/auth/me
  app.get("/me", { preHandler: [requireAuth] }, async (request, reply) => {
    const auth = request.auth!;
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const activeMembership = user.memberships.find(
      (m) => m.organizationId === auth.organizationId
    );

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        xp: user.xp,
        streakDays: user.streakDays,
        activeOrganizationId: auth.organizationId,
        activeOrganizationName: activeMembership?.organization.name ?? "",
        activeRole: auth.role,
        department: auth.department,
        memberships: user.memberships.map((m) => ({
          organizationId: m.organizationId,
          organizationName: m.organization.name,
          organizationSlug: m.organization.slug,
          role: m.role,
          department: m.department,
        })),
      },
    });
  });

  // POST /api/v1/auth/switch-org
  app.post(
    "/switch-org",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = z
        .object({ organizationId: z.string().min(1) })
        .parse(request.body);
      const auth = request.auth!;

      const membership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: auth.userId,
            organizationId: body.organizationId,
          },
        },
        include: { organization: true },
      });

      if (!membership || membership.status !== "ACTIVE") {
        throw new AppError(403, "FORBIDDEN", "You do not belong to this organization");
      }

      await prisma.session.update({
        where: { id: auth.sessionId },
        data: { organizationId: membership.organizationId },
      });

      const accessToken = await signAccessToken({
        sub: auth.userId,
        email: auth.email,
        orgId: membership.organizationId,
        role: membership.role as any,
        sessionId: auth.sessionId,
      });

      const isProd = process.env.NODE_ENV === "production";
      reply.setCookie("adaptsec_access", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 15 * 60,
      });

      return reply.send({
        activeOrganizationId: membership.organizationId,
        activeOrganizationName: membership.organization.name,
        activeRole: membership.role,
      });
    }
  );

  // GET /api/v1/auth/sessions
  app.get("/sessions", { preHandler: [requireAuth] }, async (request, reply) => {
    const sessions = await prisma.session.findMany({
      where: {
        userId: request.auth!.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        organizationId: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send({
      sessions: sessions.map((s) => ({
        ...s,
        isCurrent: s.id === request.auth!.sessionId,
      })),
    });
  });

  // DELETE /api/v1/auth/sessions/:id
  app.delete(
    "/sessions/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const session = await prisma.session.findUnique({ where: { id } });

      if (!session || session.userId !== request.auth!.userId) {
        throw new AppError(404, "SESSION_NOT_FOUND", "Session not found");
      }

      await prisma.session.update({
        where: { id },
        data: { revokedAt: new Date() },
      });

      return reply.send({ revoked: true });
    }
  );
}
