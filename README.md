# AdaptSec — Enterprise Cybersecurity Behavior Change Platform

> Transform human risk into an active cyber defense layer through realistic multi-channel simulations, an adaptive pedagogical engine, and gamified defense labs.

---

## 1. Problem & Solution

### The Real-World Problem
Over 85% of modern breaches originate at the human layer: AI-generated spear phishing, mobile smishing, WhatsApp task scams, UPI payment fraud, fake-boss/BEC wire requests, voice-clone vishing, QR-code traps, and credential reuse. Traditional annual compliance training is passive, text-heavy, and produces zero behavioral conditioning.

### The AdaptSec Solution
AdaptSec is an active behavior-change platform that:
1. **Drops learners into 68 realistic attack simulations** across 5 channels (Email Inbox, SMS, WhatsApp, UPI Payment screen, Voice Call audio ticker, and Fake Login Spotter).
2. **Measures decision correctness, hesitation time**, and specific spotted vs. missed red flags.
3. **Builds a per-user Human Risk Profile** (score 0-100 across 7 core competencies).
4. **Adapts dynamically**: An IRT/Elo adaptive engine and SM-2 spaced repetition scheduler target individual weak spots with difficulty scaling.
5. **Gives organizations risk heatmaps**, campaign drives, compliance trends, and verifiable certificates.

---

## 2. Key Modules & Features

### 🎮 Gamified Mini-Labs
- **Threat Triage**: High-speed inbox triage (upgraded Phish Shooter) with streak multipliers and post-round debrief (no alert popups).
- **PassForge Lab**: 100% client-side password entropy evaluation using zxcvbn principles, GPU crack-time estimates, breach warnings, and a challenge mode. *Never transmits typed passwords to any server.*
- **NetShield Defense**: HTML5 Canvas tower defense game. Threat types (phishing, malware, brute force, ransomware, MITM) are neutralized only by the matching safeguard (email filter, antivirus, MFA, backups, VPN/TLS).
- **Daily Spot the Scam**: 60-second rapid-fire challenge with a weekly community leaderboard.

### 🎯 5 Multi-Channel Attack Simulators
- **Inbox Simulator**: Inspectable SPF/DKIM headers, hoverable link previews, attachment scanner preview modal.
- **SMS & WhatsApp Simulator**: Mobile phone frame with authentic messaging bubbles, APK delivery traps, and job lures.
- **UPI & Payment Fraud Simulator**: Mobile UPI payment screen demonstrating the Golden Rule of UPI: *PIN is only for DEBITS, never to receive money*.
- **Voice Call / Vishing Simulator**: Audio transcript ticker with delay simulation, executive voice cloning, and fake police 'Digital Arrest' extortion.
- **Fake Login Page Spotter**: Browser chrome frame with interactive SSL padlock certificates and homoglyph domain detection.

### 📊 Dashboards & Analytics
- **Learner Dashboard**: Real-time Human Risk Score (0-100), Recharts Skill Radar, Cyber Rank titles, streak tracker, and adaptive recommendation cards.
- **Org Admin Dashboard**: Department-level risk heatmap matrix, 6-month resilience trend chart, top missed red flags, and CSV export.
- **Campaign Drives**: Assign simulation tracks with deadlines and automated console email nudges.
- **Verifiable Certificates**: Cryptographically unique IDs with public `/verify/[code]` authentication.
- **Content Studio**: Live authoring workspace for scenarios and questions with real-time simulator preview and JSON export/import.
- **Cyber Threat Feed**: Curated "Scam of the Week" cards convertible to active simulations.

---

## 3. Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript (Strict)
- **Styling & UI**: Tailwind CSS, Lucide React, Framer Motion
- **Database & ORM**: PostgreSQL / SQLite + Prisma ORM
- **Visualizations**: Recharts
- **Password Engine**: Client-side `zxcvbn`
- **Validation**: Zod
- **Testing**: Vitest (14 unit tests covering adaptive engine and catalog integrity)
- **Containerization**: Docker + Docker Compose

---

## 4. Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rishikesh106/AdaptSec-A-cybersecurity-awareness-platform.git
   cd AdaptSec-A-cybersecurity-awareness-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment:**
   Create `.env` (already provided in template):
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="adaptsec-production-super-secret-key-change-in-prod-2026"
   NEXTAUTH_URL="http://localhost:3000"
   LLM_ENABLED="false"
   LLM_PROVIDER="mock"
   EMAIL_PROVIDER="console"
   ```

4. **Initialize Database & Seed 68 Scenarios:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Demo Accounts & RBAC Testing

You can instantly switch between roles at any time using the **Role Switcher dropdown** in the top navigation bar:

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Learner** | `learner@adaptsec.io` | `AdaptSec@2026!` | Engineering |
| **Org Admin** | `admin@adaptsec.io` | `AdaptSec@2026!` | Security Operations |
| **Content Author** | `author@adaptsec.io` | `AdaptSec@2026!` | Curriculum & Threat Intel |
| **Super Admin** | `superadmin@adaptsec.io` | `AdaptSec@2026!` | Executive Leadership |

---

## 6. Running Tests

Run the complete Vitest unit test suite covering the adaptive engine, Elo/IRT scoring, SM-2 scheduling, and scenario catalog consistency:

```bash
npm test
```

Expected output:
```
✓ tests/adaptive.test.ts  (9 tests)
✓ tests/scenarios.test.ts (5 tests)
Test Files  2 passed (2)
Tests       14 passed (14)
```

---

## 7. Production Deployment Guide

### Deploying to Vercel with Managed PostgreSQL (Neon / Supabase / Railway)

1. Provision a PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Set `DATABASE_URL` in your Vercel project environment variables:
   ```env
   DATABASE_URL="postgresql://user:password@ep-host.neon.tech/adaptsec?sslmode=require"
   ```
3. Update `prisma/schema.prisma` datasource provider to `postgresql`.
4. Deploy on Vercel:
   ```bash
   vercel
   ```
5. Run migrations and seed:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

### Deploying with Docker Compose
To run AdaptSec with a local PostgreSQL container:
```bash
docker-compose up -d --build
```
This starts PostgreSQL on port 5432 and the AdaptSec web application on port 3000.

---

## 8. Documentation Index

- [docs/overview.md](docs/overview.md): High-level system architecture, target users, and RBAC matrix.
- [docs/adaptive-engine.md](docs/adaptive-engine.md): Mathematical formulations for Elo/IRT mastery, SM-2 intervals, and Human Risk scoring.
- [docs/content-authoring.md](docs/content-authoring.md): Scenario creation guide, red flag taxonomy, and JSON schema.
- [PLAN.md](PLAN.md): Architectural roadmap, Mermaid diagrams, and entity-relationship models.
