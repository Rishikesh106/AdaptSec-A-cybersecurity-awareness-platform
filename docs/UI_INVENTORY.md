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
