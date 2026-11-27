import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@adaptsec/db";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { recordAuditLog } from "../lib/audit.js";

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().min(2).max(80).optional(),
  notificationPrefs: z
    .object({
      emailReminders: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
      scamAlerts: z.boolean().optional(),
    })
    .optional(),
});

const UpdateOrgSettingsSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  domain: z.string().max(120).optional().nullable(),
  settingsJson: z
    .object({
      passThreshold: z.number().int().min(50).max(100).optional(),
      mfaEnforcementPolicy: z.enum(["OPTIONAL", "RECOMMENDED", "REQUIRED"]).optional(),
      campaignDefaultDays: z.number().int().min(1).max(90).optional(),
    })
    .optional(),
});

const DeleteAccountSchema = z.object({
  confirmEmail: z.string().email(),
});

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/settings", { preHandler: [requireAuth] }, async (request, reply) => {
    const auth = request.auth!;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        notificationPrefs: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: auth.userId,
          organizationId: auth.organizationId,
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            domain: true,
            settingsJson: true,
          },
        },
      },
    });

    const isAdmin =
      auth.role === "ORG_ADMIN" || auth.role === "SUPER_ADMIN";

    return reply.send({
      profile: {
        ...user,
        department: membership?.department ?? auth.department,
        role: membership?.role ?? auth.role,
      },
      organization: isAdmin ? membership?.organization ?? null : null,
    });
  });

  app.patch(
    "/settings/profile",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const auth = request.auth!;
      const body = UpdateProfileSchema.parse(request.body);

      const currentUser = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { notificationPrefs: true },
      });
      if (!currentUser) {
        throw new AppError(404, "USER_NOT_FOUND", "User not found");
      }

      const existingPrefs =
        typeof currentUser.notificationPrefs === "object" &&
        currentUser.notificationPrefs !== null
          ? (currentUser.notificationPrefs as Record<string, unknown>)
          : {};

      const updatedUser = await prisma.user.update({
        where: { id: auth.userId },
        data: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.notificationPrefs
            ? {
                notificationPrefs: {
                  ...existingPrefs,
                  ...body.notificationPrefs,
                },
              }
            : {}),
        },
        select: {
          id: true,
          email: true,
          name: true,
          notificationPrefs: true,
        },
      });

      if (body.department) {
        await prisma.membership.update({
          where: {
            userId_organizationId: {
              userId: auth.userId,
              organizationId: auth.organizationId,
            },
          },
          data: { department: body.department },
        });
      }

      return reply.send({
        profile: {
          ...updatedUser,
          department: body.department ?? auth.department,
        },
      });
    }
  );

  app.patch(
    "/settings/org",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const auth = request.auth!;
      const body = UpdateOrgSettingsSchema.parse(request.body);

      const org = await prisma.organization.findUnique({
        where: { id: auth.organizationId },
      });
      if (!org) {
        throw new AppError(404, "ORG_NOT_FOUND", "Organization not found");
      }

      const existingSettings =
        typeof org.settingsJson === "object" && org.settingsJson !== null
          ? (org.settingsJson as Record<string, unknown>)
          : {};

      const updated = await prisma.organization.update({
        where: { id: auth.organizationId },
        data: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.domain !== undefined ? { domain: body.domain } : {}),
          ...(body.settingsJson
            ? {
                settingsJson: {
                  ...existingSettings,
                  ...body.settingsJson,
                },
              }
            : {}),
        },
      });

      await recordAuditLog({
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: "ORG_SETTINGS_UPDATED",
        targetType: "Organization",
        targetId: auth.organizationId,
        metadata: body,
        ipAddress: request.ip,
      });

      return reply.send({ organization: updated });
    }
  );

  app.get(
    "/settings/data-export",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const auth = request.auth!;

      const [user, memberships, attempts, skillMastery, gameSessions, certificates, badges] =
        await Promise.all([
          prisma.user.findUnique({
            where: { id: auth.userId },
            select: {
              id: true,
              email: true,
              name: true,
              emailVerified: true,
              xp: true,
              streakDays: true,
              notificationPrefs: true,
              createdAt: true,
            },
          }),
          prisma.membership.findMany({
            where: { userId: auth.userId },
            include: {
              organization: { select: { id: true, name: true, slug: true } },
            },
          }),
          prisma.attempt.findMany({
            where: { userId: auth.userId, organizationId: auth.organizationId },
            orderBy: { createdAt: "desc" },
            take: 500,
          }),
          prisma.skillMastery.findMany({
            where: { userId: auth.userId, organizationId: auth.organizationId },
          }),
          prisma.gameSession.findMany({
            where: { userId: auth.userId, organizationId: auth.organizationId },
            take: 200,
          }),
          prisma.certificate.findMany({
            where: { userId: auth.userId, organizationId: auth.organizationId },
          }),
          prisma.userBadge.findMany({
            where: { userId: auth.userId },
            include: { badge: true },
          }),
        ]);

      await recordAuditLog({
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: "USER_DATA_EXPORTED",
        targetType: "User",
        targetId: auth.userId,
        metadata: {},
        ipAddress: request.ip,
      });

      return reply
        .header("Content-Type", "application/json; charset=utf-8")
        .header(
          "Content-Disposition",
          'attachment; filename="adaptsec-my-data.json"'
        )
        .send(
          JSON.stringify(
            {
              exportedAt: new Date().toISOString(),
              user,
              memberships,
              skillMastery,
              attempts,
              gameSessions,
              certificates,
              badges,
            },
            null,
            2
          )
        );
    }
  );

  app.delete(
    "/settings/account",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const auth = request.auth!;
      const body = DeleteAccountSchema.parse(request.body);

      if (body.confirmEmail.toLowerCase() !== auth.email.toLowerCase()) {
        throw new AppError(
          400,
          "EMAIL_MISMATCH",
          "Confirmation email does not match your account email"
        );
      }

      await recordAuditLog({
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: "USER_ACCOUNT_DELETED",
        targetType: "User",
        targetId: auth.userId,
        metadata: { email: auth.email },
        ipAddress: request.ip,
      });

      await prisma.user.delete({ where: { id: auth.userId } });

      reply.clearCookie("adaptsec_access", { path: "/" });
      reply.clearCookie("adaptsec_refresh", { path: "/api/v1/auth" });

      return reply.send({ deleted: true });
    }
  );
}
