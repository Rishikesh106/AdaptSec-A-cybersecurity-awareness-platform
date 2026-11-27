import { z } from "zod";

export const RoleEnum = z.enum([
  "LEARNER",
  "ORG_ADMIN",
  "CONTENT_AUTHOR",
  "SUPER_ADMIN",
]);
export type Role = z.infer<typeof RoleEnum>;

export const SkillTagEnum = z.enum([
  "phishing",
  "credentials",
  "payments",
  "social_eng",
  "browsing_wifi",
  "data_privacy",
  "incident_response",
]);
export type SkillTag = z.infer<typeof SkillTagEnum>;

export const ChannelEnum = z.enum([
  "INBOX",
  "SMS",
  "WHATSAPP",
  "UPI",
  "VOICE_CALL",
  "FAKE_LOGIN",
]);
export type Channel = z.infer<typeof ChannelEnum>;

export const DifficultyEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const DecisionEnum = z.enum([
  "REPORT_PHISH",
  "IGNORE_SAFE",
  "CLICK_LINK",
  "ENTER_CREDENTIALS",
  "APPROVE_PAYMENT",
  "COMPLY_REQUEST",
  "ESCALATE_SOC",
]);
export type Decision = z.infer<typeof DecisionEnum>;

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email("Enter a valid work email address"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
  organizationName: z.string().min(2).max(120).optional(),
  department: z.string().min(2).max(80).default("General"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(10),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(10).max(128),
});

// Pagination & Filtering
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().max(120).optional(),
});

// Orgs, Memberships & Invites
export const CreateInviteSchema = z.object({
  email: z.string().email(),
  role: RoleEnum.default("LEARNER"),
  department: z.string().min(2).max(80).default("General"),
});

export const AcceptInviteSchema = z.object({
  token: z.string().min(10),
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(10).max(128).optional(),
});

export const UpdateMembershipSchema = z.object({
  role: RoleEnum.optional(),
  department: z.string().min(2).max(80).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

// Attempts
export const SubmitAttemptSchema = z.object({
  scenarioId: z.string().min(1).optional(),
  questionId: z.string().min(1).optional(),
  decision: z.string().min(1),
  selectedOptionIds: z.array(z.string()).optional(),
  timeMs: z.number().int().min(0).max(3600000),
  flagsFound: z.array(z.string()).default([]),
});

// Error Envelope
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export interface AuthUserDTO {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  xp: number;
  streakDays: number;
  activeOrganizationId: string;
  activeOrganizationName: string;
  activeRole: Role;
  department: string;
  memberships: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: Role;
    department: string;
  }[];
}

// Milestone 7: Campaigns, Reports & Scam of the Week
export const CreateCampaignSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(5).max(2000),
  trackId: z.string().min(1).optional(),
  scenarioIds: z.array(z.string().min(1)).default([]),
  scheduledAt: z.string().datetime().optional(),
  deadline: z.string().datetime(),
  targetDepartments: z.array(z.string().min(1)).optional(),
  userIds: z.array(z.string().min(1)).optional(),
  launchNow: z.boolean().default(true),
});

export const RequestReportExportSchema = z.object({
  format: z.enum(["CSV", "PDF"]),
  reportType: z
    .enum(["ORG_RISK_SUMMARY", "CAMPAIGN_COMPLIANCE", "USER_RISK_MATRIX"])
    .default("ORG_RISK_SUMMARY"),
});

export const CreateScamOfTheWeekSchema = z.object({
  title: z.string().min(4).max(180),
  category: z.string().min(2).max(80),
  channel: ChannelEnum,
  threatLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
  summary: z.string().min(10).max(2000),
  realWorldIncident: z.string().min(10).max(3000),
  indicators: z.array(z.string().min(2).max(240)).min(1),
  preventiveAdvice: z.string().min(10).max(2000),
  scenarioId: z.string().min(1).optional(),
});

export const UpdateScamOfTheWeekSchema = CreateScamOfTheWeekSchema.partial();
