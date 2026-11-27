import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { prisma } from "@adaptsec/db";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { z } from "zod";

const GameTypeEnum = z.enum([
  "threat-triage",
  "netshield",
  "passforge",
  "daily-spot",
]);

interface TriageItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  isPhish: boolean;
  explanation: string;
}

const TRIAGE_ITEMS: TriageItem[] = [
  {
    id: "tr-1",
    sender: "Accounts <billing@meridian.in>",
    subject: "Monthly Travel Reimbursement Approved",
    preview: "Your travel expense #EXP-928 has been scheduled for Friday payroll.",
    isPhish: false,
    explanation: "Authenticated internal corporate domain and expected workflow.",
  },
  {
    id: "tr-2",
    sender: "IT Desk <support@meridian-pass-reset.co.in>",
    subject: "Password Reset Required in 1 Hour",
    preview: "Verify your SSO credentials immediately or lose mailbox access.",
    isPhish: true,
    explanation: "External lookalike domain (`meridian-pass-reset.co.in`) with 1-hour urgency.",
  },
  {
    id: "tr-3",
    sender: "SwiftEx <parcel@swiftex-hub.top>",
    subject: "Shipment #892182 Customs Fee Pending",
    preview: "Pay Rs. 25 handling fee on http://swiftex-hub.top to release parcel.",
    isPhish: true,
    explanation: "Untrusted .top TLD and unsolicited payment demand.",
  },
  {
    id: "tr-4",
    sender: "CodeHub <noreply@codehub.example>",
    subject: "[api-gateway] Pull Request #14 Merged",
    preview: "Neha merged feat/rate-limiter into main.",
    isPhish: false,
    explanation: "Routine engineering notification from verified platform domain.",
  },
  {
    id: "tr-5",
    sender: "Tax Refund <refunds@tax-gov-in.net>",
    subject: "Approved Income Tax Refund of Rs. 24,800",
    preview: "Submit NetBanking PIN to credit pending refund immediately.",
    isPhish: true,
    explanation: "Government agencies use .gov.in and never request NetBanking PINs.",
  },
  {
    id: "tr-6",
    sender: "Vikram Malhotra <vikram.exec.corp@webmail.example>",
    subject: "Discreet favor — at your desk?",
    preview: "Buy 5x retail gift cards and email me the scratched codes.",
    isPhish: true,
    explanation: "Personal webmail sender + gift-card purchase demand.",
  },
];

const NETSHIELD_CONTROLS: Record<string, { control: string; why: string }> = {
  PHISHING: {
    control: "EMAIL_FILTER",
    why: "Email security gateways inspect SPF/DKIM/DMARC and strip deceptive phishing links before delivery.",
  },
  MALWARE: {
    control: "ANTIVIRUS",
    why: "EDR/Antivirus inspects file signatures and behavioral execution to quarantine malicious payloads.",
  },
  BRUTE_FORCE: {
    control: "MFA_VAULT",
    why: "Multi-factor authentication blocks automated credential stuffing even if a password is guessed.",
  },
  RANSOMWARE: {
    control: "BACKUPS",
    why: "Immutable air-gapped backups allow full recovery without paying ransom.",
  },
  MITM: {
    control: "VPN_TLS",
    why: "Encrypted VPN and mutual TLS tunnels prevent eavesdropping and session hijacking on public Wi-Fi.",
  },
};

export async function gamesRoutes(app: FastifyInstance) {
  // POST /api/v1/games/:type/start
  app.post(
    "/games/:type/start",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { type } = z.object({ type: GameTypeEnum }).parse(request.params);
      const auth = request.auth!;
      const seed = crypto.randomBytes(8).toString("hex");

      const session = await prisma.gameSession.create({
        data: {
          organizationId: auth.organizationId,
          userId: auth.userId,
          gameType: type,
          seed,
          eventsJson: [],
        },
      });

      if (type === "threat-triage" || type === "daily-spot") {
        return reply.status(201).send({
          sessionId: session.id,
          gameType: type,
          timeLimitSeconds: type === "daily-spot" ? 60 : 40,
          items: TRIAGE_ITEMS.map((item) => ({
            id: item.id,
            sender: item.sender,
            subject: item.subject,
            preview: item.preview,
          })),
        });
      }

      if (type === "netshield") {
        return reply.status(201).send({
          sessionId: session.id,
          gameType: type,
          waves: [
            { wave: 1, threats: ["PHISHING", "MALWARE", "BRUTE_FORCE", "MITM"] },
            { wave: 2, threats: ["PHISHING", "RANSOMWARE", "MALWARE", "BRUTE_FORCE", "MITM"] },
          ],
          controls: Object.entries(NETSHIELD_CONTROLS).map(([threat, meta]) => ({
            control: meta.control,
            blocks: threat,
            why: meta.why,
          })),
        });
      }

      // passforge
      return reply.status(201).send({
        sessionId: session.id,
        gameType: type,
        challenge: {
          id: "pf-4word-16char",
          title: "4-Word Memorable Passphrase",
          minLength: 16,
          minWords: 4,
          minScore: 4,
        },
      });
    }
  );

  // POST /api/v1/games/:type/event (server-validated step submission)
  app.post(
    "/games/:type/event",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { type } = z.object({ type: GameTypeEnum }).parse(request.params);
      const auth = request.auth!;

      const body = z
        .object({
          sessionId: z.string().min(1),
          // threat-triage / daily-spot
          itemId: z.string().optional(),
          action: z.enum(["REPORT", "SAFE"]).optional(),
          // netshield
          wave: z.number().int().min(1).max(5).optional(),
          placements: z
            .array(
              z.object({
                threat: z.string(),
                control: z.string(),
              })
            )
            .optional(),
          // passforge (metadata only — NEVER raw password)
          length: z.number().int().min(0).max(256).optional(),
          wordCount: z.number().int().min(0).max(64).optional(),
          zxcvbnScore: z.number().int().min(0).max(4).optional(),
        })
        .parse(request.body);

      const session = await prisma.gameSession.findFirst({
        where: {
          id: body.sessionId,
          userId: auth.userId,
          organizationId: auth.organizationId,
          gameType: type,
        },
      });

      if (!session) {
        throw new AppError(404, "GAME_SESSION_NOT_FOUND", "Game session not found");
      }
      if (session.completedAt) {
        throw new AppError(400, "GAME_ALREADY_FINISHED", "Game session is already completed");
      }

      const existingEvents = Array.isArray(session.eventsJson)
        ? (session.eventsJson as any[])
        : [];

      let eventRecord: Record<string, unknown> = {};

      if (type === "threat-triage" || type === "daily-spot") {
        const item = TRIAGE_ITEMS.find((i) => i.id === body.itemId);
        if (!item || !body.action) {
          throw new AppError(400, "INVALID_EVENT", "Valid itemId and action required");
        }
        const alreadyAnswered = existingEvents.some((e) => e.itemId === item.id);
        if (alreadyAnswered) {
          throw new AppError(400, "DUPLICATE_EVENT", "Item already triaged in this session");
        }
        const isCorrect =
          (body.action === "REPORT" && item.isPhish) ||
          (body.action === "SAFE" && !item.isPhish);
        eventRecord = {
          itemId: item.id,
          action: body.action,
          isCorrect,
          points: isCorrect ? 100 : -40,
        };
      } else if (type === "netshield") {
        if (!body.wave || !body.placements) {
          throw new AppError(400, "INVALID_EVENT", "Wave and placements required");
        }
        const results = body.placements.map((p) => {
          const expected = NETSHIELD_CONTROLS[p.threat];
          const blocked = expected ? expected.control === p.control : false;
          return {
            threat: p.threat,
            control: p.control,
            blocked,
            why: expected?.why ?? "Unknown threat type",
          };
        });
        const wavePoints = results.reduce(
          (sum, r) => sum + (r.blocked ? 100 : 0),
          0
        );
        eventRecord = {
          wave: body.wave,
          results,
          points: wavePoints,
        };
      } else if (type === "passforge") {
        const length = body.length ?? 0;
        const wordCount = body.wordCount ?? 0;
        const zxcvbnScore = body.zxcvbnScore ?? 0;
        const passed = length >= 16 && wordCount >= 4 && zxcvbnScore >= 4;
        eventRecord = {
          length,
          wordCount,
          zxcvbnScore,
          passed,
          points: passed ? 400 : 0,
        };
      }

      await prisma.gameSession.update({
        where: { id: session.id },
        data: {
          eventsJson: [...existingEvents, eventRecord] as object,
        },
      });

      return reply.send({ accepted: true, event: eventRecord });
    }
  );

  // POST /api/v1/games/:type/finish (computes authoritative serverScore from persisted events)
  app.post(
    "/games/:type/finish",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { type } = z.object({ type: GameTypeEnum }).parse(request.params);
      const auth = request.auth!;
      const { sessionId } = z
        .object({ sessionId: z.string().min(1) })
        .parse(request.body);

      const session = await prisma.gameSession.findFirst({
        where: {
          id: sessionId,
          userId: auth.userId,
          organizationId: auth.organizationId,
          gameType: type,
        },
      });

      if (!session) {
        throw new AppError(404, "GAME_SESSION_NOT_FOUND", "Game session not found");
      }
      if (session.completedAt) {
        return reply.send({
          sessionId: session.id,
          serverScore: session.serverScore,
          xpAwarded: session.xpAwarded,
          alreadyCompleted: true,
        });
      }

      const events = Array.isArray(session.eventsJson)
        ? (session.eventsJson as any[])
        : [];

      const rawScore = events.reduce((acc, e) => acc + (Number(e.points) || 0), 0);
      const serverScore = Math.max(0, rawScore);
      const xpAwarded = Math.min(200, Math.max(20, Math.round(serverScore / 4)));

      const skillTag =
        type === "passforge"
          ? "credentials"
          : type === "netshield"
          ? "browsing_wifi"
          : "phishing";

      await prisma.$transaction(async (tx) => {
        await tx.gameSession.update({
          where: { id: session.id },
          data: {
            serverScore,
            xpAwarded,
            completedAt: new Date(),
          },
        });

        await tx.xPEvent.create({
          data: {
            organizationId: auth.organizationId,
            userId: auth.userId,
            amount: xpAwarded,
            reason: `Training Lab: ${type}`,
          },
        });

        await tx.user.update({
          where: { id: auth.userId },
          data: { xp: { increment: xpAwarded }, lastActiveAt: new Date() },
        });

        const existingSkill = await tx.skillMastery.findUnique({
          where: {
            userId_organizationId_skillTag: {
              userId: auth.userId,
              organizationId: auth.organizationId,
              skillTag,
            },
          },
        });

        const nextScore = Math.min(
          100,
          Math.round((existingSkill?.score ?? 50) + (serverScore >= 300 ? 4 : 1))
        );

        await tx.skillMastery.upsert({
          where: {
            userId_organizationId_skillTag: {
              userId: auth.userId,
              organizationId: auth.organizationId,
              skillTag,
            },
          },
          update: {
            score: nextScore,
            attemptsCount: { increment: 1 },
            correctCount: { increment: serverScore >= 200 ? 1 : 0 },
            lastTestedAt: new Date(),
          },
          create: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            skillTag,
            score: nextScore,
            attemptsCount: 1,
            correctCount: serverScore >= 200 ? 1 : 0,
            lastTestedAt: new Date(),
          },
        });

        if (type === "passforge" && serverScore >= 400) {
          const badge = await tx.badge.findUnique({
            where: { slug: "passphrase-architect" },
          });
          if (badge) {
            await tx.userBadge.upsert({
              where: { userId_badgeId: { userId: auth.userId, badgeId: badge.id } },
              update: {},
              create: { userId: auth.userId, badgeId: badge.id },
            });
          }
        }
      });

      const review =
        type === "threat-triage" || type === "daily-spot"
          ? events.map((ev) => {
              const item = TRIAGE_ITEMS.find((i) => i.id === ev.itemId);
              return {
                itemId: ev.itemId,
                subject: item?.subject ?? "",
                action: ev.action,
                isCorrect: ev.isCorrect,
                actualLabel: item?.isPhish ? "PHISHING" : "LEGITIMATE",
                explanation: item?.explanation ?? "",
              };
            })
          : events;

      return reply.send({
        sessionId: session.id,
        gameType: type,
        serverScore,
        xpAwarded,
        review,
      });
    }
  );
}
