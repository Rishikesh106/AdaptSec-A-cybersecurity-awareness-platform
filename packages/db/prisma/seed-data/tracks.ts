export interface SeedTrack {
  slug: string;
  title: string;
  description: string;
  skillTag: string;
  orderIndex: number;
  estimatedMinutes: number;
  lessons: {
    slug: string;
    title: string;
    summary: string;
    durationMinutes: number;
    orderIndex: number;
    contentMarkdown: string;
    checkpointsJson: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
  }[];
}

export const SEED_TRACKS: SeedTrack[] = [
  {
    slug: "phishing-and-smishing",
    title: "Phishing & Smishing",
    description:
      "Inspect sender headers, decode deceptive hyperlinks, and recognize urgent SMS and WhatsApp lures before clicking.",
    skillTag: "phishing",
    orderIndex: 1,
    estimatedMinutes: 25,
    lessons: [
      {
        slug: "phishing-header-and-domain-inspection",
        title: "Header & Sender Domain Inspection",
        summary:
          "How to distinguish display name spoofing from authenticated Return-Path, SPF, and DKIM headers.",
        durationMinutes: 5,
        orderIndex: 1,
        contentMarkdown:
          "### Reading Email Headers Like an Analyst\n\nDisplay names can be set to any string by the sender. Always inspect the actual mailbox domain after the `@` symbol and check `Authentication-Results` (`spf`, `dkim`, `dmarc`).\n\n1. **Lookalike domains**: Watch for `0` replacing `o`, `rn` replacing `m`, or extra hyphens (`-support-verify.com`).\n2. **Subdomain traps**: In `login.acmecorp.com.verify-auth.net`, the true registered domain is `verify-auth.net`.",
        checkpointsJson: [
          {
            question:
              "Which part of `https://portal.veritas-bank.com.session-check.net/login` determines the true host?",
            options: [
              "portal.veritas-bank.com",
              "veritas-bank.com",
              "session-check.net",
              "login",
            ],
            correctIndex: 2,
            explanation:
              "The registrable domain immediately precedes the first single slash (`/`). Here `session-check.net` owns the server.",
          },
        ],
      },
      {
        slug: "smishing-and-apk-traps",
        title: "Mobile Smishing & Malicious APK Lures",
        summary:
          "Spot fraudulent utility disconnection SMS messages, courier redelivery fees, and sideloaded Android packages.",
        durationMinutes: 5,
        orderIndex: 2,
        contentMarkdown:
          "### Mobile Messaging Threat Patterns\n\nAttackers send SMS from personal 10-digit numbers instead of registered 6-character DLT headers (e.g., `VM-PWRGRID`).\n\n- **Never install `.apk` files** sent over SMS or WhatsApp (often disguised as electricity receipts or wedding invitations).\n- **Shortened URLs** hide the destination host; verify independently via the official provider app.",
        checkpointsJson: [
          {
            question:
              "An SMS from `+91 98100 00112` warns your power will be cut at 9:30 PM unless you install `BillUpdate.apk`. What is the correct response?",
            options: [
              "Install the APK to check the pending balance",
              "Call the 10-digit number to confirm",
              "Ignore, block, and verify your bill only in the official utility portal",
              "Reply STOP to unsubscribe",
            ],
            correctIndex: 2,
            explanation:
              "Legitimate utilities never send `.apk` installers or disconnection threats from personal mobile numbers.",
          },
        ],
      },
    ],
  },
  {
    slug: "passwords-and-mfa",
    title: "Passwords & MFA",
    description:
      "Build high-entropy passphrases, eliminate credential reuse, and defend against MFA push fatigue and OAuth consent phishing.",
    skillTag: "credentials",
    orderIndex: 2,
    estimatedMinutes: 20,
    lessons: [
      {
        slug: "passphrase-entropy-and-reuse",
        title: "Passphrase Entropy & Credential Stuffing",
        summary:
          "Why length beats leetspeak complexity and how password managers stop credential stuffing.",
        durationMinutes: 5,
        orderIndex: 1,
        contentMarkdown:
          "### Why Length Beats Complexity\n\nModern GPU clusters crack 8-character complex strings like `P@ssw0rd!` in seconds. A 4-word random passphrase (e.g., `timber-velvet-harbor-quartz`) provides exponentially higher entropy and is easier to remember.\n\nNever reuse corporate passwords on external websites; breached credential lists are replayed automatically across enterprise SSO portals.",
        checkpointsJson: [
          {
            question:
              "Why do password managers help prevent phishing compromises?",
            options: [
              "They encrypt your Wi-Fi traffic",
              "They refuse to autofill credentials on lookalike or homoglyph domains",
              "They automatically change your password daily",
              "They block all incoming emails",
            ],
            correctIndex: 1,
            explanation:
              "Password managers bind credentials to the exact origin domain and will not autofill on a spoofed URL.",
          },
        ],
      },
      {
        slug: "mfa-fatigue-and-oauth-consent",
        title: "Defeating MFA Push Bombing & OAuth Grants",
        summary:
          "Respond properly to unsolicited authenticator prompts and suspicious third-party app permissions.",
        durationMinutes: 5,
        orderIndex: 2,
        contentMarkdown:
          "### MFA Fatigue Attacks\n\nIf you receive repeated authenticator push notifications you did not initiate, an attacker already possesses your password.\n\n- **Deny** the prompt immediately.\n- **Reset** your password and notify Security Operations.\n- **Inspect OAuth screens**: Never grant `Mail.ReadWrite` or `Offline_Access` to unverified third-party apps.",
        checkpointsJson: [
          {
            question:
              "You receive 8 unexpected MFA push prompts at 11 PM. What does this indicate?",
            options: [
              "A routine server maintenance check",
              "Your primary password is compromised and an attacker is attempting to force MFA approval",
              "Your authenticator app needs an update",
              "Your account has already been deleted",
            ],
            correctIndex: 1,
            explanation:
              "MFA push bombing only occurs after an attacker successfully submits your valid username and password.",
          },
        ],
      },
    ],
  },
  {
    slug: "payment-upi-and-invoice-fraud",
    title: "Payment, UPI & Invoice Fraud",
    description:
      "Prevent UPI collect-request traps, QR-code reverse scams, vendor bank-change BEC, and fake refund links.",
    skillTag: "payments",
    orderIndex: 3,
    estimatedMinutes: 25,
    lessons: [
      {
        slug: "upi-pin-and-qr-rules",
        title: "UPI Collect Traps & QR-Code Safety",
        summary:
          "Master the protocol rule that stops 95% of digital payment scams: PINs are only for outgoing debits.",
        durationMinutes: 5,
        orderIndex: 1,
        contentMarkdown:
          "### The Golden Rule of UPI\n\n**You NEVER enter your UPI PIN or scan a QR code to receive money.**\n\nEntering a UPI PIN always authorizes a debit from your bank account. Scammers posing as marketplace buyers send collect requests labeled *'Receive Rs. 15,000'* hoping you tap Pay and enter your PIN.",
        checkpointsJson: [
          {
            question:
              "A marketplace buyer asks you to scan their QR code and enter your UPI PIN to receive an advance payment. What happens if you comply?",
            options: [
              "The advance is credited to your bank account",
              "The specified amount is debited from your bank account to the scammer",
              "The app holds the funds in escrow",
              "Nothing happens",
            ],
            correctIndex: 1,
            explanation:
              "Scanning a payment QR code and entering your UPI PIN always debits funds from your account.",
          },
        ],
      },
      {
        slug: "vendor-invoice-bec-controls",
        title: "Vendor Invoice & Bank-Change Verification",
        summary:
          "Enforce out-of-band verification before updating supplier remittance details.",
        durationMinutes: 5,
        orderIndex: 2,
        contentMarkdown:
          "### Business Email Compromise (BEC)\n\nAttackers compromise or spoof supplier mailboxes and request urgent changes to beneficiary bank accounts.\n\n- Never trust a new bank account sent solely by email.\n- Call the vendor using a **previously verified phone number** from your vendor master file, not the number listed in the suspicious email.",
        checkpointsJson: [
          {
            question:
              "A regular vendor emails requesting an urgent bank account update for a Rs. 4,50,000 invoice. What must you do first?",
            options: [
              "Reply to the email asking for confirmation",
              "Pay half now and half later",
              "Call the vendor using a pre-existing verified contact number from your vendor directory",
              "Update the ERP immediately if the PDF logo matches",
            ],
            correctIndex: 2,
            explanation:
              "Out-of-band callback to a pre-verified number breaks the attacker's control of the email thread.",
          },
        ],
      },
    ],
  },
  {
    slug: "social-engineering-and-voice-cloning",
    title: "Social Engineering & Voice Cloning",
    description:
      "Counter authority pretexting, AI voice-clone vishing calls, and fake law-enforcement extortion.",
    skillTag: "social_eng",
    orderIndex: 4,
    estimatedMinutes: 20,
    lessons: [
      {
        slug: "executive-pretexting-and-voice-cloning",
        title: "AI Voice Cloning & Executive Pretexting",
        summary:
          "Recognize urgency, secrecy, and channel-switching in deepfake voice and fake-boss requests.",
        durationMinutes: 5,
        orderIndex: 1,
        contentMarkdown:
          "### Synthetic Voice Vishing\n\nModern synthesis models can clone a leader's voice from a few seconds of public webinar audio. Attackers combine realistic voice cadence with **secrecy** (*'Do not tell Finance'*) and **urgency** (*'Wire closes in 30 minutes'*).\n\nAlways enforce dual-authorization and call back on the executive's registered internal number.",
        checkpointsJson: [
          {
            question:
              "Which combination of cues strongly indicates an executive impersonation attack?",
            options: [
              "Routine weekly standup reminder on corporate Slack",
              "Urgent secrecy demand, bypassing standard approval gates, and a request for gift cards or an unverified wire",
              "Calendar invite from your direct manager",
              "IT ticket confirmation email",
            ],
            correctIndex: 1,
            explanation:
              "Urgency + secrecy + bypassing dual controls is the classic pretexting triad.",
          },
        ],
      },
      {
        slug: "digital-arrest-and-authority-scams",
        title: "Fake Authority & 'Digital Arrest' Extortion",
        summary:
          "Identify impersonation of telecom, customs, and police officials over phone and video calls.",
        durationMinutes: 5,
        orderIndex: 2,
        contentMarkdown:
          "### Understanding Authority Extortion\n\nFraudsters impersonate telecom regulators, customs agents, or cyber police claiming your ID is linked to seized contraband.\n\n- **No law enforcement agency conducts 'digital arrests' over video calls** or asks citizens to transfer funds to 'verification accounts'.\n- Disconnect immediately and report on national cyber helpline 1930.",
        checkpointsJson: [
          {
            question:
              "A caller claiming to be a police inspector demands you stay on a video call and transfer funds to an 'RBI clearing vault' to clear your Aadhaar. What should you do?",
            options: [
              "Transfer a small amount to prove cooperation",
              "Stay on the call so you are not arrested",
              "Hang up immediately and report to local authorities / cyber helpline 1930",
              "Share your bank statement on screen",
            ],
            correctIndex: 2,
            explanation:
              "Law enforcement never demands money transfers or conducts video-call detentions.",
          },
        ],
      },
    ],
  },
  {
    slug: "safe-browsing-and-wifi",
    title: "Safe Browsing & Wi-Fi",
    description:
      "Spot typosquatting, understand what HTTPS actually guarantees, and secure devices on untrusted public networks.",
    skillTag: "browsing_wifi",
    orderIndex: 5,
    estimatedMinutes: 20,
    lessons: [
      {
        slug: "https-myths-and-homoglyphs",
        title: "HTTPS Myths & Homoglyph Domains",
        summary:
          "Why a padlock icon does not prove a website is legitimate, and how to catch lookalike characters.",
        durationMinutes: 5,
        orderIndex: 1,
        contentMarkdown:
          "### The Padlock Myth\n\nHTTPS only encrypts traffic between your browser and the destination server—it does **not** verify that the domain owner is trustworthy. Phishing sites routinely obtain free TLS certificates.\n\nInspect the exact characters in the address bar (`googIe.com` with uppercase `I` vs `google.com`).",
        checkpointsJson: [
          {
            question: "What does a green or closed padlock icon in the browser bar guarantee?",
            options: [
              "The website belongs to a verified legitimate company",
              "Traffic in transit is encrypted, regardless of whether the site is legitimate or phishing",
              "The site is free of malware",
              "Your password cannot be stolen if you type it",
            ],
            correctIndex: 1,
            explanation:
              "TLS/HTTPS secures the transport channel, not the trustworthiness of the domain owner.",
          },
        ],
      },
      {
        slug: "public-wifi-and-evil-twins",
        title: "Public Wi-Fi & Evil Twin Access Points",
        summary:
          "Protect corporate sessions at airports, hotels, and cafes using VPNs and disabled sharing.",
        durationMinutes: 5,
        orderIndex: 2,
        contentMarkdown:
          "### Evil Twin Hotspots\n\nAttackers set up open Wi-Fi hotspots named `Airport_Free_WiFi` to intercept unencrypted traffic or inject fake captive portals.\n\n- Use your corporate VPN or mobile hotspot for work.\n- Disable OS file sharing and auto-connect to open networks.",
        checkpointsJson: [
          {
            question:
              "An open airport Wi-Fi captive portal asks you to install a 'Root Security Certificate' to access the internet. What should you do?",
            options: [
              "Install the certificate so browsing works",
              "Disconnect immediately—installing an untrusted root cert enables traffic interception",
              "Enter your corporate SSO password",
              "Ignore the warning and proceed",
            ],
            correctIndex: 1,
            explanation:
              "Installing an attacker's root certificate lets them decrypt all HTTPS traffic on your device.",
          },
        ],
      },
    ],
  },
  {
    slug: "data-handling-and-privacy",
    title: "Data Handling & Privacy",
    description:
      "Protect PII under India's DPDP Act and GDPR, sanitize shared cloud links, and avoid shadow-AI data leaks.",
    skillTag: "data_privacy",
    orderIndex: 6,
    estimatedMinutes: 15,
    lessons: [
      {
        slug: "pii-and-ai-tool-hygiene",
        title: "PII Protection & Public AI Tool Boundaries",
        summary:
          "Prevent accidental exposure of customer records, Aadhaar/PAN data, and source code in public tools.",
        durationMinutes: 5,
        orderIndex: 1,
        contentMarkdown:
          "### Data Minimization & AI Tools\n\nNever paste unredacted customer PII (names, phone numbers, PAN, Aadhaar, payroll sheets) or proprietary source code into consumer public AI assistants without approved enterprise data processing agreements.",
        checkpointsJson: [
          {
            question:
              "You need to summarize a 20-page customer spreadsheet containing Aadhaar and bank details. What is the safe approach?",
            options: [
              "Paste the raw spreadsheet into a public free AI chatbot",
              "Use only an approved enterprise workspace tool or redact/anonymize all PII first",
              "Change the file extension to .txt before uploading",
              "Upload it to a public pastebin link",
            ],
            correctIndex: 1,
            explanation:
              "PII must stay within authorized enterprise boundaries or be thoroughly anonymized.",
          },
        ],
      },
      {
        slug: "cloud-sharing-and-permissions",
        title: "Least-Privilege Cloud Sharing",
        summary:
          "Audit 'Anyone with the link' permissions before sharing internal spreadsheets and documents.",
        durationMinutes: 5,
        orderIndex: 2,
        contentMarkdown:
          "### Scope Your Share Links\n\nDefaulting cloud documents to *'Anyone with the link can view'* exposes internal reports if a link is forwarded externally. Always restrict to named recipients and set expiration dates for external partners.",
        checkpointsJson: [
          {
            question:
              "Which sharing setting is safest when collaborating on a quarterly finance sheet with one external auditor?",
            options: [
              "Anyone on the internet with the link",
              "Specific invited email address with view-only permission and an expiration date",
              "Publicly indexed folder",
              "Forwarding the raw file via personal WhatsApp",
            ],
            correctIndex: 1,
            explanation:
              "Named recipient access with an expiry enforces least privilege.",
          },
        ],
      },
    ],
  },
  {
    slug: "incident-reporting",
    title: "Incident Reporting",
    description:
      "Report suspicious indicators quickly, preserve forensic context, and contain accidental credential exposures.",
    skillTag: "incident_response",
    orderIndex: 7,
    estimatedMinutes: 15,
    lessons: [
      {
        slug: "rapid-escalation-after-a-click",
        title: "What To Do Within 5 Minutes of a Mistake",
        summary:
          "Why fast, blameless reporting lets security teams revoke tokens before lateral movement occurs.",
        durationMinutes: 5,
        orderIndex: 1,
        contentMarkdown:
          "### Speed Beats Perfection\n\nIf you accidentally enter credentials on a suspicious page or open an unknown attachment:\n1. **Disconnect** from the network if malware execution is suspected.\n2. **Report immediately** to IT/Security so active sessions and OAuth tokens can be revoked.\n3. **Never delete** the email or browser history—analysts need the headers and URL to block the campaign for everyone else.",
        checkpointsJson: [
          {
            question:
              "You realize 30 seconds after submitting your password that the login URL was spoofed. What is your best first action?",
            options: [
              "Keep quiet and hope nothing happens",
              "Clear your browser history to remove evidence",
              "Immediately report to Security/IT and reset your password via the official portal",
              "Wait until Monday morning",
            ],
            correctIndex: 2,
            explanation:
              "Immediate reporting enables session revocation before attackers can pivot or exfiltrate data.",
          },
        ],
      },
      {
        slug: "preserving-phishing-evidence",
        title: "Preserving Evidence for Triage",
        summary:
          "How to forward suspicious emails as attachments or capture URLs without triggering payloads.",
        durationMinutes: 5,
        orderIndex: 2,
        contentMarkdown:
          "### Preserving Full Headers\n\nTaking a screenshot hides SPF/DKIM headers and exact hyperlink targets. Use the built-in **Report Phish** button or attach the original `.eml` message so security analysts can extract Indicators of Compromise (IoCs).",
        checkpointsJson: [
          {
            question:
              "Why does security ask for the original email or 'Report Phish' submission rather than a cropped screenshot?",
            options: [
              "Screenshots use too much storage",
              "Full headers contain Return-Path, SPF/DKIM results, and exact destination URLs needed to block the sender",
              "Screenshots cannot be read by humans",
              "Email forwarding automatically deletes viruses",
            ],
            correctIndex: 1,
            explanation:
              "Analysts rely on raw headers and full URLs to write organization-wide mail blocks.",
          },
        ],
      },
    ],
  },
];
