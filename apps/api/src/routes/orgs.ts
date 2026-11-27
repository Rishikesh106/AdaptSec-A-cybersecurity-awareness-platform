import type { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { prisma } from "@adaptsec/db";
import {
  CreateInviteSchema,
  AcceptInviteSchema,
  UpdateMembershipSchema,
  PaginationQuerySchema,
} from "@adaptsec/shared";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { generateOpaqueToken, hashOpaqueToken } from "../lib/tokens.js";
import { emailAdapter } from "../lib/email.js";
import { recordAuditLog } from "../lib/audit.js";
import { loadEnv } from "../config/env.js";
import { z } from "zod";

export async function orgRoutes(app: FastifyInstance) {
  // GET /api/v1/orgs (returns orgs the user belongs to; SUPER_ADMIN sees all)
  app.get("/orgs", { preHandler: [requireAuth] }, async (request, reply) => {
    const auth = request.auth!;
    if (auth.role === "SUPER_ADMIN") {
      const orgs = await prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
      });
      return reply.send({ items: orgs });
    }

    const memberships = await prisma.membership.findMany({
      where: { userId: auth.userId, status: "ACTIVE" },
      include: { organization: true },
    });
    return reply.send({
      items: memberships.map((m) => ({
        ...m.organization,
        role: m.role,
        department: m.department,
      })),
    });
  });

  // GET /api/v1/memberships (scoped strictly to active organizationId)
  app.get(
    "/memberships",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN", "CONTENT_AUTHOR")] },
    async (request, reply) => {
      const query = PaginationQuerySchema.extend({
        role: z.string().optional(),
        department: z.string().optional(),
      }).parse(request.query);

      const orgId = request.auth!.organizationId;
      const where: any = { organizationId: orgId };
      if (query.role) where.role = query.role;
      if (query.department) where.department = query.department;
      if (query.search) {
        where.user = {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ],
        };
      }

      const [total, items] = await Promise.all([
        prisma.membership.count({ where }),
        prisma.membership.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                xp: true,
                streakDays: true,
                lastActiveAt: true,
                emailVerified: true,
              },
            },
          },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { createdAt: query.sortOrder },
        }),
      ]);

      return reply.send({
        items,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    }
  );

  // PATCH /api/v1/memberships/:id (tenant-scoped)
  app.patch(
    "/memberships/:id",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = UpdateMembershipSchema.parse(request.body);
      const orgId = request.auth!.organizationId;

      const existing = await prisma.membership.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!existing) {
        throw new AppError(404, "MEMBERSHIP_NOT_FOUND", "Membership not found in this organization");
      }

      const updated = await prisma.membership.update({
        where: { id },
        data: {
          role: body.role,
          department: body.department,
          status: body.status,
        },
      });

      await recordAuditLog({
        organizationId: orgId,
        actorId: request.auth!.userId,
        action: "MEMBERSHIP_UPDATED",
        targetType: "Membership",
        targetId: id,
        metadata: body as Record<string, unknown>,
        ipAddress: request.ip,
      });

      return reply.send({ membership: updated });
    }
  );

  // DELETE /api/v1/memberships/:id (tenant-scoped)
  app.delete(
    "/memberships/:id",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const orgId = request.auth!.organizationId;

      const existing = await prisma.membership.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!existing) {
        throw new AppError(404, "MEMBERSHIP_NOT_FOUND", "Membership not found in this organization");
      }

      await prisma.membership.delete({ where: { id } });

      await recordAuditLog({
        organizationId: orgId,
        actorId: request.auth!.userId,
        action: "MEMBERSHIP_REMOVED",
        targetType: "Membership",
        targetId: id,
        ipAddress: request.ip,
      });

      return reply.send({ deleted: true });
    }
  );

  // GET /api/v1/invites (tenant-scoped)
  app.get(
    "/invites",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const items = await prisma.invite.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
      });
      return reply.send({ items });
    }
  );

  // POST /api/v1/invites (tenant-scoped)
  app.post(
    "/invites",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const body = CreateInviteSchema.parse(request.body);
      const orgId = request.auth!.organizationId;
      const email = body.email.toLowerCase().trim();

      const rawToken = generateOpaqueToken(24);
      const invite = await prisma.invite.create({
        data: {
          organizationId: orgId,
          email,
          role: body.role,
          department: body.department,
          tokenHash: hashOpaqueToken(rawToken),
          invitedById: request.auth!.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const env = loadEnv();
      await emailAdapter.send({
        to: email,
        subject: "You have been invited to AdaptSec",
        html: `<p>Accept your invitation: <a href="${env.WEB_URL}/accept-invite?token=${rawToken}">Join Organization</a></p>`,
      });

      await recordAuditLog({
        organizationId: orgId,
        actorId: request.auth!.userId,
        action: "INVITE_CREATED",
        targetType: "Invite",
        targetId: invite.id,
        metadata: { email, role: body.role },
        ipAddress: request.ip,
      });

      return reply.status(201).send({
        invite,
        ...(process.env.NODE_ENV !== "production" ? { devInviteToken: rawToken } : {}),
      });
    }
  );

  // POST /api/v1/invites/accept
  app.post("/invites/accept", async (request, reply) => {
    const body = AcceptInviteSchema.parse(request.body);
    const tokenHash = hashOpaqueToken(body.token);

    const invite = await prisma.invite.findUnique({ where: { tokenHash } });
    if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt < new Date()) {
      throw new AppError(400, "INVALID_INVITE", "Invitation is invalid or expired");
    }

    let user = await prisma.user.findUnique({ where: { email: invite.email } });
    if (!user) {
      if (!body.name || !body.password) {
        throw new AppError(
          400,
          "ACCOUNT_DETAILS_REQUIRED",
          "Name and password are required to accept this invitation"
        );
      }
      const passwordHash = await argon2.hash(body.password, {
        type: argon2.argon2id,
      });
      user = await prisma.user.create({
        data: {
          email: invite.email,
          name: body.name.trim(),
          passwordHash,
          emailVerified: true,
        },
      });
    }

    const membership = await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invite.organizationId,
        },
      },
      update: {
        role: invite.role,
        department: invite.department,
        status: "ACTIVE",
      },
      create: {
        userId: user.id,
        organizationId: invite.organizationId,
        role: invite.role,
        department: invite.department,
        status: "ACTIVE",
      },
    });

    await prisma.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    return reply.send({ accepted: true, membership });
  });

  // DELETE /api/v1/invites/:id (revoke, tenant-scoped)
  app.delete(
    "/invites/:id",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const orgId = request.auth!.organizationId;

      const invite = await prisma.invite.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!invite) {
        throw new AppError(404, "INVITE_NOT_FOUND", "Invite not found");
      }

      await prisma.invite.update({
        where: { id },
        data: { revokedAt: new Date() },
      });

      return reply.send({ revoked: true });
    }
  );
}
