# AdaptSec — UI Interactive Element Inventory

Every interactive element in the frontend is documented here alongside its backend API endpoint, database effect, and automated test coverage. Zero dead UI elements are permitted.

| Page | Element | Action | API Endpoint | DB Effect | Test |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Sign in link | Navigate to `/login` | — | — | Smoke M1 |
| `/` | Create workspace link | Navigate to `/register` | — | — | Smoke M1 |
| `/login` | Sign in form | Authenticate user & set httpOnly cookies | `POST /api/v1/auth/login` | Creates `Session`, updates `User.lastActiveAt` | `apps/api/tests/auth.test.ts` |
| `/login` | Forgot password link | Navigate to `/forgot-password` | — | — | Smoke M1 |
| `/register` | Registration form | Create user + org + admin membership | `POST /api/v1/auth/register` | Creates `Organization`, `User`, `Membership`, `VerificationToken`, `Session` | `apps/api/tests/auth.test.ts` |
| `/forgot-password` | Request reset form | Generate reset token & queue email | `POST /api/v1/auth/forgot-password` | Creates `PasswordResetToken` | `apps/api/tests/auth.test.ts` |
| `/reset-password` | Reset password form | Update password hash & revoke sessions | `POST /api/v1/auth/reset-password` | Updates `User.passwordHash`, marks token used | `apps/api/tests/auth.test.ts` |
| `/verify-email` | Auto-verify on load | Verify email token | `POST /api/v1/auth/verify-email` | Sets `User.emailVerified = true` | `apps/api/tests/auth.test.ts` |
| `AppShell` | Org switcher select | Switch active org context in session | `POST /api/v1/auth/switch-org` | Updates `Session.organizationId` & issues new JWT | `apps/api/tests/tenant.test.ts` |
| `AppShell` | Sign out button | Revoke session & clear cookies | `POST /api/v1/auth/logout` | Sets `Session.revokedAt` | `apps/api/tests/auth.test.ts` |
| `/sessions` | Revoke button | Revoke another active session | `DELETE /api/v1/auth/sessions/:id` | Sets `Session.revokedAt` | `apps/api/tests/auth.test.ts` |
| `/team` | Search input | Filter org members by name/email | `GET /api/v1/memberships` | Reads `Membership` scoped by `organizationId` | `apps/api/tests/tenant.test.ts` |
| `/team` | Send invite form | Create org invitation & send email | `POST /api/v1/invites` | Creates `Invite` & `AuditLog` | `apps/api/tests/tenant.test.ts` |
| `/team` | Role select | Update member role | `PATCH /api/v1/memberships/:id` | Updates `Membership.role` & creates `AuditLog` | `apps/api/tests/tenant.test.ts` |
| `/team` | Revoke invite button | Revoke pending invite | `DELETE /api/v1/invites/:id` | Sets `Invite.revokedAt` | `apps/api/tests/tenant.test.ts` |
| `/tracks` | Search input | Filter tracks by title/description | `GET /api/v1/tracks` | Queries `Track` | `apps/api/tests/content.test.ts` |
| `/tracks` | Open track link | Navigate to `/tracks/[slug]` | `GET /api/v1/tracks/:slug` | Reads `Track`, `Lesson`, `Scenario` | `apps/api/tests/content.test.ts` |
| `/tracks/[slug]` | Lesson selector buttons | Switch active lesson reader | — | — | `apps/web` M2 |
| `/tracks/[slug]` | Comprehension check button | Validate lesson checkpoint locally | — | — | `apps/web` M2 |
| `/simulations` | Channel/difficulty/search filters | Filter paginated scenarios | `GET /api/v1/scenarios` | Queries `Scenario` scoped by org | `apps/api/tests/content.test.ts` |
| `/simulations` | Pagination Next/Prev buttons | Page through scenario catalog | `GET /api/v1/scenarios` | Offset/limit query | `apps/api/tests/content.test.ts` |
| `/simulations` | Inspect button & detail drawer | Open scenario brief | `GET /api/v1/scenarios/:slug` | Reads `Scenario` (redFlags hidden for Learner) | `apps/api/tests/content.test.ts` |
| `/simulations` | Launch link | Navigate to `/simulations/[slug]` | — | — | Smoke M3 |
| `/simulations/[slug]` | Inspect headers toggle (`InboxSimulator`) | Reveal SPF/DKIM/DMARC & Return-Path | — | — | `InboxSimulator` |
| `/simulations/[slug]` | Hyperlink hover & click (`InboxSimulator`) | Show target URL / submit `CLICK_LINK` | `POST /api/v1/attempts` | Creates `Attempt`, updates `SkillMastery`, `User.xp` | `apps/api/tests/attempts.test.ts` |
| `/simulations/[slug]` | Attachment inspect modal (`InboxSimulator`) | View file metadata & scanner notes | — | — | `InboxSimulator` |
| `/simulations/[slug]` | Report phish / Escalate / Safe buttons | Submit decision & timeMs to server | `POST /api/v1/attempts` | Scores attempt, updates SM-2 & XP | `apps/api/tests/attempts.test.ts` |
| `/simulations/[slug]` | Retry scenario button | Reset hesitation timer & state | — | — | `SimulationFeedbackPanel` |
| `/quiz` | Mode & Skill selectors + Start button | Fetch non-repeating prioritized quiz | `GET /api/v1/quiz/session` | Reads `Question`, `Attempt`, `SkillMastery` | `apps/api/tests/quiz-adaptive.test.ts` |
| `/quiz` | Submit answer button | Score MCQ/Multi-Select & update SM-2 | `POST /api/v1/attempts` | Creates `Attempt`, updates `SkillMastery` | `apps/api/tests/quiz-adaptive.test.ts` |
| `/baseline` | Continue / Finish buttons | Calibrate baseline skill profile | `POST /api/v1/attempts`, `GET /api/v1/skills/mastery`, `GET /api/v1/recommendations/next` | Updates `SkillMastery` & returns risk score | `apps/api/tests/quiz-adaptive.test.ts` |
| `/games` | Lab tabs (Threat Triage / PassForge / NetShield / Daily 60s) | Switch active training lab | — | — | `apps/web` M5 |
| `/games` | Threat Triage & Daily 60s controls | Start, submit Report/Safe, finish | `POST /api/v1/games/:type/start`, `event`, `finish` | Creates & scores `GameSession`, awards XP | `apps/api/tests/games.test.ts` |
| `/games` | PassForge input & Complete challenge button | Client-side `zxcvbn` + metadata submit | `POST /api/v1/games/passforge/start`, `event`, `finish` | Stores `GameSession` metadata (never raw password), awards badge | `apps/api/tests/games.test.ts` |
| `/games` | NetShield safeguard selects & Run wave button | Validate wave placements & finish | `POST /api/v1/games/netshield/start`, `event`, `finish` | Stores wave results & `serverScore` | `apps/api/tests/games.test.ts` |
