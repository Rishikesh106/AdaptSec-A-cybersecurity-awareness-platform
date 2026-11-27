# AdaptSec — Content Authoring & Scenario Creation Guide

AdaptSec provides an interactive Content Studio (`/author`) that enables cybersecurity curriculum designers and threat intelligence teams to author, test, and publish realistic attack scenarios.

---

## 1. Scenario JSON Schema Specification

Every simulation scenario adheres to the following TypeScript interface:

```typescript
interface Scenario {
  id: string;                      // Unique ID (e.g., "scen-inbox-microsoft-password")
  slug: string;                    // URL-safe slug
  title: string;                   // User-facing scenario title
  channel: Channel;                // "INBOX" | "SMS" | "WHATSAPP" | "UPI" | "VOICE_CALL" | "FAKE_LOGIN"
  difficulty: Difficulty;          // "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
  skillTag: string;                // e.g., "phishing", "payments", "credentials"
  description: string;             // Scenario contextual summary
  scenarioContent: {
    subject?: string;
    senderName?: string;
    senderAddress?: string;
    senderDomain?: string;
    body: string;
    attachments?: AttachmentMeta[];
    links?: { anchor: string; actualUrl: string; isMalicious: boolean }[];
    upiVpa?: string;
    upiAmount?: number;
    callTranscript?: { speaker: "caller" | "agent"; text: string; delaySec: number }[];
    fakeLoginPageUrl?: string;
  };
  redFlags: RedFlag[];
  correctAction: Decision;         // "REPORT_PHISH" | "IGNORE_SAFE" | "ESCALATE_SOC"
  explanationOnSuccess: string;
  explanationOnFailure: string;
  whatToDoInstead: string;
  isPublished: boolean;
}
```

---

## 2. Red Flag Taxonomy

Red flags embedded within scenarios must be categorized into one of eight standardized categories:

1. **`SENDER`**: Unofficial domain, display name mismatch, personal freemail address for corporate executives.
2. **`URL`**: Typosquatting, homoglyphs (e.g., `micros0ft.com`, `googIe.com`), deceptive subdomains, untrusted TLDs (`.top`, `.cc`, `.buzz`).
3. **`ATTACHMENT`**: Dangerous file extensions (`.exe`, `.iso`, `.vhd`, `.xlsm` with macros, disguised `.apk`).
4. **`PSYCHOLOGICAL_URGENCY`**: Panic triggers (*"Power cutoff at 9:30 PM"*, *"Account suspended in 2 hours"*).
5. **`GRAMMAR_TONE`**: Overly demanding language, strange salutations, inconsistent formatting.
6. **`REQUEST_TYPE`**: Prohibited corporate actions (gift card purchases, confidential wire transfers).
7. **`AUTH_BYPASS`**: Illicit OAuth consent scopes, MFA push fatigue bombardment.
8. **`PAYMENT_TRAP`**: QR code scan-to-receive deceptions, collect requests disguised as credits.

---

## 3. Best Practices for Threat Authors
- **No Fictitious Domains That Resemble Real Individuals**: Use clearly fictional corporate domains (e.g., `amaz0n-security-alert.net`, `incometax-gov-in.net`).
- **Include Legitimate Control Baseline Scenarios**: Approximately 15-20% of scenarios must represent legitimate internal emails or verified merchant payments to train learners against trigger-happy false positives.
- **Provide Actionable Takeaways**: The `whatToDoInstead` property must tell learners the exact verified out-of-band step to take (e.g., *"Call back on verified internal PBX directory"*).
