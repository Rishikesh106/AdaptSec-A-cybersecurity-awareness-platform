# AdaptSec — Adaptive Engine & Scoring Specifications

The AdaptSec Adaptive Engine (`src/lib/adaptive.ts`) is implemented as a pure, zero-dependency, unit-tested TypeScript module. It combines three core pedagogical algorithms:
1. **Item Response Theory (IRT) & Elo-Style Skill Mastery Rating** (0 to 100)
2. **SuperMemo SM-2 Spaced Repetition Scheduling** for missed attack indicators
3. **Multi-Domain Human Risk Score Computation**

---

## 1. Item Response Theory (IRT) Skill Mastery

Mastery is computed independently across seven cybersecurity competency domains:
- `phishing` (Phishing & Smishing)
- `credentials` (Passwords & MFA)
- `payments` (Payment, UPI & Invoice Fraud)
- `social_eng` (Social Engineering & Deepfake Voice)
- `browsing_wifi` (Safe Browsing & Public Wi-Fi)
- `data_privacy` (Data Handling & Privacy Safeguards)
- `incident_response` (Incident Reporting & Escalation)

### Mathematical Formulation
For each interaction with a scenario of difficulty \(D \in \{\text{BEGINNER}, \text{INTERMEDIATE}, \text{ADVANCED}, \text{EXPERT}\}\), the expected probability of success \(E\) is given by the logistic curve:

\[
E = \frac{1}{1 + e^{-(M - \theta_D) / 15}}
\]

where:
- \(M\) is the learner's current mastery score (0 to 100).
- \(\theta_D\) is the difficulty threshold (\(\theta_{\text{BEGINNER}} = 35\), \(\theta_{\text{INTERMEDIATE}} = 50\), \(\theta_{\text{ADVANCED}} = 71\), \(\theta_{\text{EXPERT}} = 95\)).

The actual outcome \(S\) accounts for both binary correctness and the ratio of red flags identified:
\[
S = \begin{cases} 
0.7 + 0.3 \times \frac{F_{\text{found}}}{F_{\text{total}}} & \text{if correct} \\
0.2 \times \frac{F_{\text{found}}}{F_{\text{total}}} & \text{if incorrect}
\end{cases}
\]

The mastery delta \(\Delta M\) is computed using a dynamic K-factor modulated by hesitation time:
\[
\Delta M = K_D \times (S - E) + \text{Bonus}_{\text{speed}}
\]
where \(\text{Bonus}_{\text{speed}}\) rewards deliberate vigilance while penalizing rushed, impulsive clicks (< 4.0s).

---

## 2. SuperMemo SM-2 Spaced Repetition Scheduler

When a learner misses red flags or fails a simulation checkpoint, the indicator is scheduled for periodic re-testing. Quality \(q \in [0, 5]\) is assessed:
- \(q = 5\): Perfect response, all red flags spotted under target time.
- \(q = 4\): Correct response after deliberation.
- \(q = 3\): Correct response with minor missed flags.
- \(q \le 2\): Failure / Malicious payload triggered.

### Interval Calculation
\[
I(n) = \begin{cases}
1 \text{ day} & \text{for } n = 1 \\
3 \text{ days} & \text{for } n = 2 \\
7 \text{ days} & \text{for } n = 3 \\
I(n-1) \times EF & \text{for } n > 3
\end{cases}
\]

The Ease Factor (\(EF\)) adapts dynamically:
\[
EF' = \max\left(1.3, EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)\right)
\]

---

## 3. Human Risk Score (0 to 100)

The Human Risk Score represents organizational vulnerability. It is computed as the inverse weighted sum of domain masteries, with non-linear escalation penalties applied when critical high-loss attack vectors (Payments/UPI and Phishing) drop below baseline:

\[
\text{Risk} = \max\left(0, \min\left(100, 100 - \sum w_i M_i\right)\right)
\]

- **0 - 25**: Cyber Guardian (Resilient)
- **26 - 50**: Low-to-Moderate Risk
- **51 - 75**: Elevated Vulnerability
- **76 - 100**: Critical Threat Liability
