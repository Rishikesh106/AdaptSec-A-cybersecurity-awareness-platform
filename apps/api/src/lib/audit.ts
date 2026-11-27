import { prisma } from "@adaptsec/db";

export interface AuditInput {
  organizationId?: string | null;
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function recordAuditLog(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId ?? null,
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        metadataJson: (input.metadata ?? {}) as object,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch {
    // Audit log failure should never crash primary request flow
  }
}
