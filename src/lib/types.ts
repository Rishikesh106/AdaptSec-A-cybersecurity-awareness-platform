export type Role = "LEARNER" | "ORG_ADMIN" | "MANAGER" | "AUTHOR" | "SUPER_ADMIN";

export type Channel = "INBOX" | "SMS" | "WHATSAPP" | "UPI" | "VOICE_CALL" | "FAKE_LOGIN";

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type Decision = "REPORT_PHISH" | "IGNORE_SAFE" | "CLICK_LINK" | "ENTER_CREDENTIALS" | "APPROVE_PAYMENT" | "COMPLY_REQUEST" | "ESCALATE_SOC";

export interface RedFlag {
  id: string;
  category: "SENDER" | "URL" | "ATTACHMENT" | "PSYCHOLOGICAL_URGENCY" | "GRAMMAR_TONE" | "REQUEST_TYPE" | "AUTH_BYPASS" | "PAYMENT_TRAP";
  title: string;
  explanation: string;
  locationHint?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface AttachmentMeta {
  fileName: string;
  fileSize: string;
  fileType: "pdf" | "exe" | "docx" | "xlsx" | "zip" | "iso" | "html";
  suspiciousCharacteristics?: string[];
  safePreviewHtml?: string;
}

export interface ScenarioContent {
  subject?: string;
  senderName?: string;
  senderAddress?: string;
  senderDomain?: string;
  recipientName?: string;
  recipientAddress?: string;
  body: string;
  attachments?: AttachmentMeta[];
  links?: { anchor: string; actualUrl: string; isMalicious: boolean }[];
  phoneCallerId?: string;
  callTranscript?: { speaker: "caller" | "agent"; text: string; delaySec: number }[];
  upiVpa?: string;
  upiAmount?: number;
  upiMerchantName?: string;
  upiNote?: string;
  fakeLoginPageUrl?: string;
  fakeLoginBrandedCompany?: string;
}

export interface Scenario {
  id: string;
  title: string;
  slug: string;
  channel: Channel;
  difficulty: Difficulty;
  skillTag: string;
  description: string;
  scenarioContent: ScenarioContent;
  redFlags: RedFlag[];
  correctAction: Decision;
  explanationOnSuccess: string;
  explanationOnFailure: string;
  whatToDoInstead: string;
  isPublished: boolean;
  orderIndex: number;
}

export interface AttemptResult {
  id?: string;
  userId: string;
  scenarioId: string;
  decision: Decision;
  isCorrect: boolean;
  timeMs: number;
  flagsFound: string[];
  flagsMissed: string[];
  scoreEarned: number;
  newSkillMastery: number;
  xpAwarded: number;
  createdAt?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface Question {
  id: string;
  type: "MCQ" | "MULTI_SELECT" | "SCENARIO_BASED" | "DRAG_MATCH" | "SPOT_FLAG";
  skillTag: string;
  difficulty: Difficulty;
  prompt: string;
  options: QuestionOption[];
  explanation: string;
  imageUrl?: string;
  matchPairs?: { left: string; right: string }[];
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string;
  skillTag: string;
  iconName: string;
  estimatedMinutes: number;
  lessonsCount: number;
  scenariosCount: number;
}

export interface Lesson {
  id: string;
  trackId: string;
  title: string;
  orderIndex: number;
  durationMinutes: number;
  summary: string;
  contentMarkdown: string;
  checkpoints: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  organizationName?: string;
  organizationId?: string;
  xp: number;
  level: number;
  streakDays: number;
  humanRiskScore: number; // 0 (safest) to 100 (highest risk)
  skillsMastery: Record<string, number>; // 0 to 100 per skill
  cyberRankTitle: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  unlockedAt?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  trackTitle: string;
  trackId: string;
  targetDepartment?: string;
  deadline: string;
  assignedCount: number;
  completedCount: number;
  averageScore: number;
  status: "ACTIVE" | "COMPLETED" | "DRAFT";
}

export interface CertificateInfo {
  id: string;
  code: string;
  userName: string;
  userEmail: string;
  trackTitle: string;
  organizationName: string;
  issuedAt: string;
  verificationUrl: string;
  riskReductionPercentage: number;
  masteryScore: number;
}

export interface ScamOfTheWeekItem {
  id: string;
  title: string;
  category: string;
  channel: Channel;
  threatLevel: "MODERATE" | "HIGH" | "CRITICAL";
  date: string;
  summary: string;
  realWorldIncident: string;
  keyIndicators: string[];
  preventiveAdvice: string;
  simulationScenarioId?: string;
}
