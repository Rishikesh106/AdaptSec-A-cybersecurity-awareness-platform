import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_SEED_SCENARIOS } from "../src/data/seedScenarios";
import { SEED_TRACKS, SEED_LESSONS } from "../src/data/seedTracks";
import { SEED_QUESTIONS } from "../src/data/seedQuestions";
import { SEED_BADGES } from "../src/data/seedBadges";
import { SEED_THREAT_FEED } from "../src/data/seedThreatFeed";

const prisma = new PrismaClient();

async function main() {
  console.log("⚡ Starting AdaptSec Database Seed...");

  // 1. Create Default Organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-cyber-defense" },
    update: {},
    create: {
      name: "Acme Cyber Defense Corp",
      slug: "acme-cyber-defense",
      plan: "ENTERPRISE_PLUS",
    },
  });
  console.log(`✓ Organization created: ${org.name}`);

  // 2. Hash default passwords
  const passwordHash = await bcrypt.hash("AdaptSec@2026!", 10);

  // 3. Seed Users across roles
  const usersToSeed = [
    {
      email: "learner@adaptsec.io",
      name: "Alex Mercer",
      role: "LEARNER",
      department: "Engineering",
      xp: 2450,
      level: 3,
      streakDays: 5,
    },
    {
      email: "admin@adaptsec.io",
      name: "Priya Sundaram",
      role: "ORG_ADMIN",
      department: "Security Operations",
      xp: 8900,
      level: 7,
      streakDays: 14,
    },
    {
      email: "author@adaptsec.io",
      name: "Marcus Vance",
      role: "AUTHOR",
      department: "Curriculum & Threat Intel",
      xp: 5200,
      level: 5,
      streakDays: 8,
    },
    {
      email: "superadmin@adaptsec.io",
      name: "Elena Rostova",
      role: "SUPER_ADMIN",
      department: "Executive Leadership",
      xp: 15400,
      level: 10,
      streakDays: 32,
    },
    // Extra team members for realistic Org Admin Heatmap
    {
      email: "rahul.nair@adaptsec.io",
      name: "Rahul Nair",
      role: "LEARNER",
      department: "Finance & Accounts",
      xp: 1100,
      level: 2,
      streakDays: 2,
    },
    {
      email: "sneha.patel@adaptsec.io",
      name: "Sneha Patel",
      role: "LEARNER",
      department: "Human Resources",
      xp: 3200,
      level: 4,
      streakDays: 7,
    },
    {
      email: "david.kim@adaptsec.io",
      name: "David Kim",
      role: "LEARNER",
      department: "Marketing & Growth",
      xp: 850,
      level: 1,
      streakDays: 1,
    },
  ];

  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        department: u.department,
        xp: u.xp,
        level: u.level,
        streakDays: u.streakDays,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        department: u.department,
        organizationId: org.id,
        xp: u.xp,
        level: u.level,
        streakDays: u.streakDays,
      },
    });

    // Seed baseline skill masteries for learners
    const initialSkills: Record<string, number> = {
      phishing: u.department === "Security Operations" ? 92 : 64,
      credentials: u.department === "Finance & Accounts" ? 48 : 72,
      payments: u.department === "Finance & Accounts" ? 52 : 78,
      social_eng: u.department === "Human Resources" ? 82 : 58,
      browsing_wifi: 68,
      data_privacy: u.department === "Human Resources" ? 88 : 74,
      incident_response: u.department === "Security Operations" ? 95 : 60,
    };

    for (const [skillTag, score] of Object.entries(initialSkills)) {
      await prisma.skillMastery.upsert({
        where: {
          userId_skillTag: {
            userId: user.id,
            skillTag,
          },
        },
        update: { score },
        create: {
          userId: user.id,
          skillTag,
          score,
          attemptsCount: 6,
          correctCount: 4,
        },
      });
    }
  }
  console.log(`✓ Seeded ${usersToSeed.length} users with skill masteries.`);

  // 4. Seed Tracks
  for (const t of SEED_TRACKS) {
    await prisma.track.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description,
        skillTag: t.skillTag,
        estimatedMinutes: t.estimatedMinutes,
      },
      create: {
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        skillTag: t.skillTag,
        iconName: t.iconName,
        estimatedMinutes: t.estimatedMinutes,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_TRACKS.length} learning tracks.`);

  // 5. Seed Lessons
  for (const l of SEED_LESSONS) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: {
        title: l.title,
        orderIndex: l.orderIndex,
        durationMinutes: l.durationMinutes,
        summary: l.summary,
        contentMarkdown: l.contentMarkdown,
        checkpointsJson: JSON.stringify(l.checkpoints),
      },
      create: {
        id: l.id,
        trackId: l.trackId,
        title: l.title,
        orderIndex: l.orderIndex,
        durationMinutes: l.durationMinutes,
        summary: l.summary,
        contentMarkdown: l.contentMarkdown,
        checkpointsJson: JSON.stringify(l.checkpoints),
      },
    });
  }
  console.log(`✓ Seeded ${SEED_LESSONS.length} curriculum lessons.`);

  // 6. Seed Scenarios (60+ scenarios)
  console.log(`⚡ Seeding ${ALL_SEED_SCENARIOS.length} scenarios...`);
  for (const s of ALL_SEED_SCENARIOS) {
    await prisma.scenario.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        channel: s.channel,
        difficulty: s.difficulty,
        skillTag: s.skillTag,
        description: s.description,
        contentJson: JSON.stringify(s.scenarioContent),
        redFlagsJson: JSON.stringify(s.redFlags),
        correctAction: s.correctAction,
        explanationSuccess: s.explanationOnSuccess,
        explanationFailure: s.explanationOnFailure,
        whatToDoInstead: s.whatToDoInstead,
        orderIndex: s.orderIndex,
      },
      create: {
        id: s.id,
        slug: s.slug,
        title: s.title,
        channel: s.channel,
        difficulty: s.difficulty,
        skillTag: s.skillTag,
        description: s.description,
        contentJson: JSON.stringify(s.scenarioContent),
        redFlagsJson: JSON.stringify(s.redFlags),
        correctAction: s.correctAction,
        explanationSuccess: s.explanationOnSuccess,
        explanationFailure: s.explanationOnFailure,
        whatToDoInstead: s.whatToDoInstead,
        orderIndex: s.orderIndex,
      },
    });
  }
  console.log(`✓ Seeded ${ALL_SEED_SCENARIOS.length} realistic attack scenarios.`);

  // 7. Seed Questions
  for (const q of SEED_QUESTIONS) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        type: q.type,
        skillTag: q.skillTag,
        difficulty: q.difficulty,
        prompt: q.prompt,
        optionsJson: JSON.stringify(q.options),
        explanation: q.explanation,
      },
      create: {
        id: q.id,
        type: q.type,
        skillTag: q.skillTag,
        difficulty: q.difficulty,
        prompt: q.prompt,
        optionsJson: JSON.stringify(q.options),
        explanation: q.explanation,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_QUESTIONS.length} quiz bank questions.`);

  // 8. Seed Badges
  for (const b of SEED_BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        description: b.description,
        icon: b.icon,
        tier: b.tier,
      },
      create: {
        id: b.id,
        slug: b.slug,
        title: b.title,
        description: b.description,
        icon: b.icon,
        tier: b.tier,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_BADGES.length} gamification badges.`);

  // 9. Seed Threat Feed (Scam of the Week)
  for (const sf of SEED_THREAT_FEED) {
    await prisma.scamOfTheWeek.upsert({
      where: { id: sf.id },
      update: {
        title: sf.title,
        category: sf.category,
        channel: sf.channel,
        threatLevel: sf.threatLevel,
        summary: sf.summary,
        realWorldIncident: sf.realWorldIncident,
        keyIndicatorsJson: JSON.stringify(sf.keyIndicators),
        preventiveAdvice: sf.preventiveAdvice,
      },
      create: {
        id: sf.id,
        title: sf.title,
        category: sf.category,
        channel: sf.channel,
        threatLevel: sf.threatLevel,
        summary: sf.summary,
        realWorldIncident: sf.realWorldIncident,
        keyIndicatorsJson: JSON.stringify(sf.keyIndicators),
        preventiveAdvice: sf.preventiveAdvice,
        simulationScenarioId: sf.simulationScenarioId,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_THREAT_FEED.length} Threat Feed items.`);

  // 10. Seed Demo Campaign & Certificate
  const learner = await prisma.user.findUnique({ where: { email: "learner@adaptsec.io" } });
  const phishTrack = await prisma.track.findUnique({ where: { slug: "phishing-and-smishing" } });

  if (learner && phishTrack) {
    const campaign = await prisma.campaign.create({
      data: {
        orgId: org.id,
        title: "Q4 2026 Executive Phishing & Smishing Resilience Campaign",
        description: "Mandatory corporate defense simulation and assessment for all engineering and finance personnel.",
        trackId: phishTrack.id,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    await prisma.campaignAssignment.create({
      data: {
        campaignId: campaign.id,
        userId: learner.id,
        status: "IN_PROGRESS",
        score: 82.5,
      },
    });

    // Seed verifiable certificate
    await prisma.certificate.upsert({
      where: { certificateCode: "ADAPTSEC-CERT-2026-88192" },
      update: {},
      create: {
        certificateCode: "ADAPTSEC-CERT-2026-88192",
        userId: learner.id,
        trackId: phishTrack.id,
        score: 88.0,
      },
    });
    console.log("✓ Seeded sample Campaign and Verifiable Certificate (ADAPTSEC-CERT-2026-88192).");
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
