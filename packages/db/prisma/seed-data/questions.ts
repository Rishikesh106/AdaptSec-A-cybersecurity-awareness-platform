import type { Difficulty, QuestionType } from "@adaptsec/shared";

export interface SeedQuestion {
  type: QuestionType;
  skillTag: string;
  difficulty: Difficulty;
  prompt: string;
  optionsJson: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
  }[];
  matchPairsJson?: { left: string; right: string }[];
  explanation: string;
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  {
    type: "MCQ",
    skillTag: "phishing",
    difficulty: "BEGINNER",
    prompt:
      "An email claims to be from 'Kestrel Cloud IT' using the address `alerts@kestrel-auth-verify.net`. What is the clearest indicator of phishing?",
    optionsJson: [
      { id: "a", text: "The email uses a standard HTML signature", isCorrect: false },
      {
        id: "b",
        text: "The sender domain `kestrel-auth-verify.net` is an unverified lookalike domain",
        isCorrect: true,
        feedback: "Always verify the exact domain after `@`.",
      },
      { id: "c", text: "The email arrived in the morning", isCorrect: false },
      { id: "d", text: "The subject line mentions password expiry", isCorrect: false },
    ],
    explanation:
      "Attackers register hyphens and verification keywords (`-auth-verify.net`) to imitate internal IT domains.",
  },
  {
    type: "MCQ",
    skillTag: "payments",
    difficulty: "BEGINNER",
    prompt:
      "When someone is paying you via UPI on PhonePe, Google Pay, or Paytm, when must you enter your UPI PIN?",
    optionsJson: [
      { id: "a", text: "When the amount exceeds Rs. 5,000", isCorrect: false },
      { id: "b", text: "When accepting money from a first-time sender", isCorrect: false },
      {
        id: "c",
        text: "Never — a UPI PIN is only required to debit money from your account",
        isCorrect: true,
      },
      { id: "d", text: "When claiming cashback scratch cards", isCorrect: false },
    ],
    explanation:
      "In the UPI protocol, entering a PIN strictly authorizes an outgoing debit transaction.",
  },
  {
    type: "MCQ",
    skillTag: "credentials",
    difficulty: "BEGINNER",
    prompt:
      "Which credential pattern provides the strongest resistance against offline GPU brute-force cracking?",
    optionsJson: [
      { id: "a", text: "An 8-character password like `Tr0ub4d!`", isCorrect: false },
      {
        id: "b",
        text: "A 20-character 4-word random passphrase like `harbor-velvet-quartz-meadow`",
        isCorrect: true,
      },
      { id: "c", text: "Your employee ID followed by your birth year", isCorrect: false },
      { id: "d", text: "Reusing a strong password with `_1` appended per site", isCorrect: false },
    ],
    explanation:
      "Passphrase length expands search space exponentially compared to short predictable substitutions.",
  },
  {
    type: "MULTI_SELECT",
    skillTag: "browsing_wifi",
    difficulty: "INTERMEDIATE",
    prompt:
      "Select TWO safeguards you should enable before working on an unencrypted airport or cafe Wi-Fi network.",
    optionsJson: [
      { id: "a", text: "Connect to your corporate VPN tunnel", isCorrect: true },
      { id: "b", text: "Disable OS file and printer sharing", isCorrect: true },
      { id: "c", text: "Click through browser TLS certificate warnings", isCorrect: false },
      { id: "d", text: "Disable your local endpoint firewall", isCorrect: false },
    ],
    explanation:
      "A VPN encrypts payloads over untrusted links and disabling local sharing prevents lateral probing.",
  },
  {
    type: "SCENARIO_BASED",
    skillTag: "social_eng",
    difficulty: "INTERMEDIATE",
    prompt:
      "A caller sounding identical to your Managing Director calls from a roaming number demanding an urgent confidential vendor wire within 20 minutes, instructing you not to mention it to Finance. What should you do?",
    optionsJson: [
      { id: "a", text: "Process the wire immediately to avoid delaying the deal", isCorrect: false },
      { id: "b", text: "Send 25% of the wire as a compromise", isCorrect: false },
      {
        id: "c",
        text: "Hang up, verify independently via the executive's known internal number, and enforce dual approval",
        isCorrect: true,
      },
      { id: "d", text: "Ask the caller to text you on WhatsApp", isCorrect: false },
    ],
    explanation:
      "AI voice cloning paired with secrecy and urgency requires out-of-band callback verification.",
  },
  {
    type: "MCQ",
    skillTag: "credentials",
    difficulty: "INTERMEDIATE",
    prompt:
      "You receive 12 rapid MFA push approval alerts at 1:30 AM while you are not signing in. What is the right action?",
    optionsJson: [
      { id: "a", text: "Approve one prompt so the notifications stop", isCorrect: false },
      {
        id: "b",
        text: "Deny the prompts, change your password immediately, and alert Security",
        isCorrect: true,
      },
      { id: "c", text: "Turn off your phone until morning", isCorrect: false },
      { id: "d", text: "Uninstall your authenticator app", isCorrect: false },
    ],
    explanation:
      "MFA push fatigue means an attacker already has your password and is trying to wear you down.",
  },
  {
    type: "MCQ",
    skillTag: "incident_response",
    difficulty: "BEGINNER",
    prompt:
      "You accidentally submitted your corporate password on a spoofed SSO login page. What should you do within the first 2 minutes?",
    optionsJson: [
      { id: "a", text: "Wait to see if suspicious emails are sent", isCorrect: false },
      { id: "b", text: "Delete your browser history", isCorrect: false },
      {
        id: "c",
        text: "Report the incident to Security/IT immediately and reset your password via the official portal",
        isCorrect: true,
      },
      { id: "d", text: "Restart your laptop without telling anyone", isCorrect: false },
    ],
    explanation:
      "Rapid reporting lets Security revoke active session cookies before attackers access internal data.",
  },
  {
    type: "MCQ",
    skillTag: "data_privacy",
    difficulty: "INTERMEDIATE",
    prompt:
      "Under India's DPDP Act and enterprise data policies, what must happen before summarizing a customer KYC spreadsheet containing PAN and Aadhaar numbers?",
    optionsJson: [
      { id: "a", text: "Upload it to any free online PDF/AI summarizer", isCorrect: false },
      {
        id: "b",
        text: "Redact/anonymize PII or use only an approved enterprise workspace with data governance",
        isCorrect: true,
      },
      { id: "c", text: "Rename the file to `notes.txt` before uploading", isCorrect: false },
      { id: "d", text: "Share it in a public Slack channel", isCorrect: false },
    ],
    explanation:
      "Unredacted PII must never leave authorized enterprise boundaries or enter public AI training logs.",
  },
  {
    type: "DRAG_MATCH",
    skillTag: "browsing_wifi",
    difficulty: "INTERMEDIATE",
    prompt: "Match each threat type to the primary security control that mitigates it.",
    optionsJson: [
      { id: "m1", text: "Phishing -> Email Security Gateway", isCorrect: true },
      { id: "m2", text: "Ransomware -> Immutable Offline Backups", isCorrect: true },
      { id: "m3", text: "Brute Force -> Multi-Factor Authentication", isCorrect: true },
      { id: "m4", text: "Public Wi-Fi MITM -> Encrypted VPN Tunnel", isCorrect: true },
    ],
    matchPairsJson: [
      { left: "Phishing", right: "Email Security Gateway" },
      { left: "Ransomware", right: "Immutable Offline Backups" },
      { left: "Brute Force", right: "Multi-Factor Authentication" },
      { left: "Public Wi-Fi MITM", right: "Encrypted VPN Tunnel" },
    ],
    explanation:
      "Defense-in-depth relies on matching specific controls to the attack vector they interrupt.",
  },
  {
    type: "SPOT_FLAG",
    skillTag: "phishing",
    difficulty: "ADVANCED",
    prompt:
      "Inspect this URL shown in a status bar preview: `https://portal.nordbank.in.account-sync-verify.co/auth/session`. Which segment proves it is malicious?",
    optionsJson: [
      { id: "a", text: "The `https://` prefix", isCorrect: false },
      {
        id: "b",
        text: "The registrable host `account-sync-verify.co` preceding `/auth/session`",
        isCorrect: true,
      },
      { id: "c", text: "The `/auth/session` path", isCorrect: false },
      { id: "d", text: "The `portal` subdomain", isCorrect: false },
    ],
    explanation:
      "`portal.nordbank.in` is only a deceptive subdomain prefix owned by `account-sync-verify.co`.",
  },
  {
    type: "MCQ",
    skillTag: "payments",
    difficulty: "ADVANCED",
    prompt:
      "A regular supplier sends a PDF invoice over email stating their bank account changed due to an internal audit. What is the mandatory control?",
    optionsJson: [
      { id: "a", text: "Reply to the email thread to verify", isCorrect: false },
      {
        id: "b",
        text: "Call the supplier's finance contact using a previously vetted phone number from your vendor master",
        isCorrect: true,
      },
      { id: "c", text: "Process payment if the PDF formatting looks identical", isCorrect: false },
      { id: "d", text: "Send a Rs. 1 test transfer and proceed", isCorrect: false },
    ],
    explanation:
      "If the vendor mailbox is compromised, replying to the email just reaches the attacker.",
  },
  {
    type: "MULTI_SELECT",
    skillTag: "phishing",
    difficulty: "BEGINNER",
    prompt:
      "Select TWO common indicators of an SMS 'electricity disconnection' smishing attack.",
    optionsJson: [
      { id: "a", text: "Originates from a personal 10-digit mobile number", isCorrect: true },
      { id: "b", text: "Links to download an `.apk` file or remote-support tool", isCorrect: true },
      { id: "c", text: "Arrives from a registered 6-character DLT sender ID", isCorrect: false },
      { id: "d", text: "Directs you to check your account inside the official utility app", isCorrect: false },
    ],
    explanation:
      "Utility smishing relies on personal phone numbers, night disconnection panic, and sideloaded APKs.",
  },
];
