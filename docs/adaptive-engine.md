# Adaptive Learning Engine

AdaptSec maintains a 7-domain Human Risk Profile per `(userId, organizationId)` across:
`phishing`, `credentials`, `payments`, `social_eng`, `browsing_wifi`, `data_privacy`, and `incident_response`.

## Scoring & Mastery (`apps/api/src/lib/adaptive.ts`)

1. **Elo / IRT Mastery Update**: Each `Attempt` against a scenario or question adjusts `SkillMastery.score` (0–100) based on item difficulty (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`), decision correctness, and inspection speed (`timeMs`).
2. **SM-2 Spaced Repetition**: `SkillMastery` tracks `easeFactor`, `intervalDays`, `repetition`, and `nextReviewAt` so missed or decaying skills resurface automatically.
3. **Adaptive Recommendations (`GET /api/v1/recommendations/next`)**: Prioritizes overdue SM-2 reviews first, followed by the learner's lowest-mastery skill domain, returning targeted simulations and quiz items.
