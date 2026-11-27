import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2";
import { SEED_TRACKS } from "./seed-data/tracks.js";
import { SEED_SCENARIOS } from "./seed-data/scenarios.js";
import { SEED_QUESTIONS } from "./seed-data/questions.js";

const prisma = new PrismaClient();

const DEMO_ORGS = [
  { name: "Meridian Logistics Pvt Ltd", slug: "meridian-logistics", domain: "meridian.in", plan: "ENTERPRISE" },
  { name: "Apex FinTech Solutions", slug: "apex-fintech", domain: "apexfintech.in", plan: "GROWTH" },
  { name: "Sahyadri Institute of Technology", slug: "sahyadri-tech", domain: "sahyadri.edu.in", plan: "ACADEMIC" },
];

const FIRST_NAMES = [
  "Aarav", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Karthik", "Meera",
  "Siddharth", "Neha", "Arjun", "Divya", "Rahul", "Kavya", "Nikhil", "Pooja",
  "Aditya", "Ritu", "Manish", "Shreya", "Deepak", "Nandini", "Suresh", "Tanvi",
  "Gaurav", "Ishita", "Vivek", "Swati", "Pranav", "Aditi", "Rajesh", "Bhavna",
  "Harish", "Komal", "Varun", "Simran",
];

const LAST_NAMES = [
  "Sharma", "Nair", "Verma", "Patel", "Malhotra", "Rao", "Iyer", "Deshmukh",
  "Kulkarni", "Mehta", "Joshi", "Gupta", "Reddy", "Pillai", "Menon", "Chatterjee",
  "Bansal", "Agarwal", "Kapoor", "Bhat", "Saxena", "Tiwari", "Kaur", "Das",
];

const DEPARTMENTS = [
  "Engineering",
  "Finance & Accounts",
  "Human Resources",
  "Operations",
  "Sales",
  "Security Operations",
];

const SKILLS = [
  "phishing",
  "credentials",
  "payments",
  "social_eng",
  "browsing_wifi",
  "data_privacy",
  "incident_response",
];

export async function runSeed(client: PrismaClient = prisma) {
  const passwordHash = await argon2.hash("AdaptSec@2026!", {
    type: argon2.argon2id,
  });

  // 1. Seed 3 Organizations
  const orgs = [];
  for (const o of DEMO_ORGS) {
    const org = await client.organization.upsert({
      where: { slug: o.slug },
      update: { name: o.name, domain: o.domain, plan: o.plan },
      create: o,
    });
    orgs.push(org);
  }
  const [org1, org2, org3] = orgs;

  // 2. Seed 4 primary demo accounts + 36 realistic org users (40 total)
  const primaryDemos: Array<{
    email: string;
    name: string;
    orgId: string;
    role: Role;
    department: string;
    xp: number;
    streakDays: number;
  }> = [
    {
      email: "learner@meridian.in",
      name: "Aarav Sharma",
      orgId: org1.id,
      role: "LEARNER",
      department: "Engineering",
      xp: 1840,
      streakDays: 6,
    },
    {
      email: "admin@meridian.in",
      name: "Priya Nair",
      orgId: org1.id,
      role: "ORG_ADMIN",
      department: "Security Operations",
      xp: 4320,
      streakDays: 14,
    },
    {
      email: "author@meridian.in",
      name: "Rohan Verma",
      orgId: org1.id,
      role: "CONTENT_AUTHOR",
      department: "Security Operations",
      xp: 3150,
      streakDays: 9,
    },
    {
      email: "superadmin@adaptsec.io",
      name: "Ananya Rao",
      orgId: org1.id,
      role: "SUPER_ADMIN",
      department: "Security Operations",
      xp: 6890,
      streakDays: 21,
    },
  ];

  const seededUsers: Array<{ id: string; orgId: string; department: string; email: string }> = [];

  for (const d of primaryDemos) {
    const u = await client.user.upsert({
      where: { email: d.email },
      update: { name: d.name, xp: d.xp, streakDays: d.streakDays, emailVerified: true },
      create: {
        email: d.email,
        name: d.name,
        passwordHash,
        emailVerified: true,
        xp: d.xp,
        streakDays: d.streakDays,
      },
    });
    await client.membership.upsert({
      where: { userId_organizationId: { userId: u.id, organizationId: d.orgId } },
      update: { role: d.role, department: d.department, status: "ACTIVE" },
      create: {
        userId: u.id,
        organizationId: d.orgId,
        role: d.role,
        department: d.department,
        status: "ACTIVE",
      },
    });
    seededUsers.push({ id: u.id, orgId: d.orgId, department: d.department, email: u.email });
  }

  // Also give superadmin membership in org2 so org-switcher has multiple orgs
  const superAdmin = await client.user.findUnique({ where: { email: "superadmin@adaptsec.io" } });
  if (superAdmin) {
    await client.membership.upsert({
      where: { userId_organizationId: { userId: superAdmin.id, organizationId: org2.id } },
      update: { role: "SUPER_ADMIN", department: "Executive", status: "ACTIVE" },
      create: {
        userId: superAdmin.id,
        organizationId: org2.id,
        role: "SUPER_ADMIN",
        department: "Executive",
        status: "ACTIVE",
      },
    });
  }

  for (let i = 0; i < 36; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const targetOrg = i < 18 ? org1 : i < 28 ? org2 : org3;
    const domain = targetOrg.domain ?? "example.com";
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@${domain}`;
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const role: Role = i === 18 || i === 28 ? "ORG_ADMIN" : "LEARNER";
    const xp = 320 + ((i * 197) % 3400);
    const streakDays = (i % 12) + 1;

    const u = await client.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `${first} ${last}`,
        passwordHash,
        emailVerified: true,
        xp,
        streakDays,
      },
    });

    await client.membership.upsert({
      where: { userId_organizationId: { userId: u.id, organizationId: targetOrg.id } },
      update: {},
      create: {
        userId: u.id,
        organizationId: targetOrg.id,
        role,
        department: dept,
        status: "ACTIVE",
      },
    });
    seededUsers.push({ id: u.id, orgId: targetOrg.id, department: dept, email: u.email });
  }

  // 3. Seed 7 Tracks & 14 Lessons
  const trackMap = new Map<string, string>();
  for (const t of SEED_TRACKS) {
    const track = await client.track.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description,
        skillTag: t.skillTag,
        orderIndex: t.orderIndex,
        estimatedMinutes: t.estimatedMinutes,
      },
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        skillTag: t.skillTag,
        orderIndex: t.orderIndex,
        estimatedMinutes: t.estimatedMinutes,
      },
    });
    trackMap.set(t.slug, track.id);

    for (const l of t.lessons) {
      await client.lesson.upsert({
        where: { slug: l.slug },
        update: {
          trackId: track.id,
          title: l.title,
          summary: l.summary,
          contentMarkdown: l.contentMarkdown,
          checkpointsJson: l.checkpointsJson,
          durationMinutes: l.durationMinutes,
          orderIndex: l.orderIndex,
        },
        create: {
          trackId: track.id,
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          contentMarkdown: l.contentMarkdown,
          checkpointsJson: l.checkpointsJson,
          durationMinutes: l.durationMinutes,
          orderIndex: l.orderIndex,
        },
      });
    }
  }

  // 4. Seed 60+ Scenarios
  const scenarioIds: Array<{ id: string; skillTag: string; correctAction: string }> = [];
  for (const s of SEED_SCENARIOS) {
    const trackId = trackMap.get(s.trackSlug) ?? null;
    const scenario = await client.scenario.upsert({
      where: { slug: s.slug },
      update: {
        trackId,
        title: s.title,
        description: s.description,
        channel: s.channel,
        difficulty: s.difficulty,
        skillTag: s.skillTag,
        contentJson: s.contentJson as object,
        redFlagsJson: s.redFlagsJson as object,
        correctAction: s.correctAction,
        explanationSuccess: s.explanationSuccess,
        explanationFailure: s.explanationFailure,
        whatToDoInstead: s.whatToDoInstead,
        orderIndex: s.orderIndex,
      },
      create: {
        trackId,
        slug: s.slug,
        title: s.title,
        description: s.description,
        channel: s.channel,
        difficulty: s.difficulty,
        skillTag: s.skillTag,
        contentJson: s.contentJson as object,
        redFlagsJson: s.redFlagsJson as object,
        correctAction: s.correctAction,
        explanationSuccess: s.explanationSuccess,
        explanationFailure: s.explanationFailure,
        whatToDoInstead: s.whatToDoInstead,
        orderIndex: s.orderIndex,
      },
    });
    scenarioIds.push({
      id: scenario.id,
      skillTag: scenario.skillTag,
      correctAction: scenario.correctAction,
    });
  }

  // 5. Seed Questions (idempotent check by count)
  const existingQCount = await client.question.count();
  if (existingQCount === 0) {
    for (const q of SEED_QUESTIONS) {
      await client.question.create({
        data: {
          type: q.type,
          skillTag: q.skillTag,
          difficulty: q.difficulty,
          prompt: q.prompt,
          optionsJson: q.optionsJson as object,
          matchPairsJson: q.matchPairsJson ? (q.matchPairsJson as object) : undefined,
          explanation: q.explanation,
        },
      });
    }
  }

  // 6. Seed SkillMastery + 3 months of Attempt history (idempotent check)
  const existingAttempts = await client.attempt.count();
  if (existingAttempts === 0) {
    const now = Date.now();
    const attemptBatch: Array<{
      organizationId: string;
      userId: string;
      scenarioId: string;
      decision: string;
      isCorrect: boolean;
      timeMs: number;
      flagsFoundJson: string[];
      flagsMissedJson: string[];
      xpAwarded: number;
      createdAt: Date;
    }> = [];

    for (let uIdx = 0; uIdx < seededUsers.length; uIdx++) {
      const u = seededUsers[uIdx];
      // Seed 7 skill masteries per user
      for (let sIdx = 0; sIdx < SKILLS.length; sIdx++) {
        const skill = SKILLS[sIdx];
        const baseScore =
          u.department === "Security Operations"
            ? 84 + ((uIdx + sIdx) % 12)
            : u.department === "Finance & Accounts" && skill === "payments"
            ? 44 + (uIdx % 14)
            : 54 + ((uIdx * 7 + sIdx * 11) % 34);

        await client.skillMastery.upsert({
          where: {
            userId_organizationId_skillTag: {
              userId: u.id,
              organizationId: u.orgId,
              skillTag: skill,
            },
          },
          update: {},
          create: {
            userId: u.id,
            organizationId: u.orgId,
            skillTag: skill,
            score: Math.min(98, baseScore),
            attemptsCount: 6 + (sIdx % 4),
            correctCount: 4 + (sIdx % 3),
            nextReviewAt: new Date(now + ((sIdx % 5) + 1) * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Generate ~8 historical attempts spread over 90 days per user (~320 attempts total)
      for (let aIdx = 0; aIdx < 8; aIdx++) {
        const scen = scenarioIds[(uIdx * 5 + aIdx * 3) % scenarioIds.length];
        const isCorrect = (uIdx + aIdx) % 4 !== 0; // 75% realistic baseline accuracy
        const daysAgo = 85 - aIdx * 11 - (uIdx % 5);
        attemptBatch.push({
          organizationId: u.orgId,
          userId: u.id,
          scenarioId: scen.id,
          decision: isCorrect ? scen.correctAction : "CLICK_LINK",
          isCorrect,
          timeMs: 9500 + ((uIdx * 1300 + aIdx * 2100) % 24000),
          flagsFoundJson: isCorrect ? ["rf-1"] : [],
          flagsMissedJson: isCorrect ? [] : ["rf-1"],
          xpAwarded: isCorrect ? 100 : 15,
          createdAt: new Date(now - Math.max(1, daysAgo) * 24 * 60 * 60 * 1000),
        });
      }
    }

    await client.attempt.createMany({ data: attemptBatch });
  }

  // 7. Seed Badges & UserBadges
  const badgeDefs = [
    { slug: "first-report", title: "First Threat Reported", description: "Accurately reported your first simulated attack.", tier: "BRONZE" },
    { slug: "upi-guardian", title: "UPI Protocol Guardian", description: "Rejected 5 UPI collect and QR traps without entering a PIN.", tier: "GOLD" },
    { slug: "phish-spotter", title: "Header Inspector", description: "Spotted 10 deceptive email sender domains.", tier: "SILVER" },
    { slug: "seven-day-streak", title: "7-Day Consistency", description: "Maintained training activity for 7 consecutive days.", tier: "SILVER" },
    { slug: "passphrase-architect", title: "Passphrase Architect", description: "Completed a PassForge Lab challenge above 80 bits of entropy.", tier: "GOLD" },
    { slug: "track-graduate", title: "Track Graduate", description: "Completed a full curriculum track with mastery verification.", tier: "PLATINUM" },
  ];

  for (const b of badgeDefs) {
    await client.badge.upsert({
      where: { slug: b.slug },
      update: { title: b.title, description: b.description, tier: b.tier },
      create: b,
    });
  }

  // Award initial badges to primary learner
  const primaryLearner = await client.user.findUnique({ where: { email: "learner@meridian.in" } });
  const firstBadge = await client.badge.findUnique({ where: { slug: "first-report" } });
  if (primaryLearner && firstBadge) {
    await client.userBadge.upsert({
      where: { userId_badgeId: { userId: primaryLearner.id, badgeId: firstBadge.id } },
      update: {},
      create: { userId: primaryLearner.id, badgeId: firstBadge.id },
    });
  }

  // 8. Seed Campaign, Certificate & ScamOfTheWeek
  const phishTrackId = trackMap.get("phishing-and-smishing");
  const adminUser = await client.user.findUnique({ where: { email: "admin@meridian.in" } });

  if (phishTrackId && adminUser && primaryLearner) {
    const existingCampaign = await client.campaign.findFirst({
      where: { organizationId: org1.id },
    });
    if (!existingCampaign) {
      const camp = await client.campaign.create({
        data: {
          organizationId: org1.id,
          title: "Q4 Phishing & UPI Fraud Readiness Drive",
          description: "Mandatory behavioral simulation campaign for Meridian Logistics staff.",
          trackId: phishTrackId,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
          createdById: adminUser.id,
        },
      });
      await client.campaignAssignment.create({
        data: {
          campaignId: camp.id,
          userId: primaryLearner.id,
          status: "IN_PROGRESS",
          score: 78.5,
        },
      });
    }

    await client.certificate.upsert({
      where: { certificateCode: "ADAPT-2026-MERIDIAN-001" },
      update: {},
      create: {
        organizationId: org1.id,
        userId: primaryLearner.id,
        trackId: phishTrackId,
        certificateCode: "ADAPT-2026-MERIDIAN-001",
        score: 88.5,
      },
    });
  }

  const existingScams = await client.scamOfTheWeek.count();
  if (existingScams === 0) {
    await client.scamOfTheWeek.createMany({
      data: [
        {
          title: "Fake 'Digital Arrest' Video Extortion Calls",
          category: "Vishing / Authority Pretexting",
          channel: "VOICE_CALL",
          threatLevel: "CRITICAL",
          summary:
            "Attackers impersonate police or telecom officers claiming an Aadhaar-linked parcel contained contraband, demanding video isolation and fund transfers.",
          realWorldIncident:
            "Reported across multiple metro cities targeting corporate employees and senior citizens.",
          indicatorsJson: [
            "Claims of 'Digital Arrest' (no such legal procedure exists)",
            "Demands to transfer savings into 'RBI verification accounts'",
            "Instruction not to speak with family or colleagues",
          ],
          preventiveAdvice:
            "Disconnect immediately and report to national cyber helpline 1930.",
        },
        {
          title: "Electricity Disconnection SMS With .APK Payload",
          category: "Smishing / Mobile Malware",
          channel: "SMS",
          threatLevel: "HIGH",
          summary:
            "Nighttime disconnection threat from personal 10-digit numbers directing victims to install a bill-update APK.",
          realWorldIncident:
            "Active across residential and SMB utility subscribers.",
          indicatorsJson: [
            "10-digit personal mobile sender instead of 6-character DLT header",
            "Prompts downloading an .apk outside official app stores",
          ],
          preventiveAdvice:
            "Check utility balances only via official provider portals.",
        },
      ],
    });
  }
}

// Execute when run directly as CLI seed script
const isMain =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].endsWith("seed.ts");

if (isMain) {
  runSeed()
    .then(() => {
      console.log("Seed completed: 3 orgs, 40 users, 7 tracks, 63 scenarios, 12 questions, 3 months history.");
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
