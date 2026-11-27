import { Track, Lesson } from "@/lib/types";

export const SEED_TRACKS: Track[] = [
  {
    id: "track-phishing",
    slug: "phishing-and-smishing",
    title: "Phishing, Smishing & Social Communication Defense",
    description: "Master the art of spotting weaponized emails, fraudulent SMS alerts, and crafted links before clicking.",
    skillTag: "phishing",
    iconName: "MailWarning",
    estimatedMinutes: 25,
    lessonsCount: 3,
    scenariosCount: 15,
  },
  {
    id: "track-credentials",
    slug: "passwords-and-mfa",
    title: "Credential Hygiene, Passkeys & MFA Defense",
    description: "Build uncrackable passphrases, thwart credential stuffing, and defeat modern MFA fatigue/push-bombing attacks.",
    skillTag: "credentials",
    iconName: "KeyRound",
    estimatedMinutes: 20,
    lessonsCount: 3,
    scenariosCount: 10,
  },
  {
    id: "track-payments",
    slug: "payment-and-upi-fraud",
    title: "UPI, Digital Payments & Financial Fraud",
    description: "Neutralize reverse payment collect traps, fake QR codes, invoice manipulation, and marketplace buyer scams.",
    skillTag: "payments",
    iconName: "CreditCard",
    estimatedMinutes: 25,
    lessonsCount: 3,
    scenariosCount: 12,
  },
  {
    id: "track-social-eng",
    slug: "social-engineering-and-deepfakes",
    title: "Social Engineering, Vishing & AI Voice Clones",
    description: "Recognize psychological manipulation, authority pretexts, and AI-synthesized executive voice attacks.",
    skillTag: "social_eng",
    iconName: "UserCheck",
    estimatedMinutes: 20,
    lessonsCount: 3,
    scenariosCount: 10,
  },
  {
    id: "track-browsing",
    slug: "safe-browsing-and-wifi",
    title: "Safe Browsing, Public Wi-Fi & Malicious Domains",
    description: "Navigate rogue public access points, punycode/homograph domains, SSL padlock misconceptions, and drive-by downloads.",
    skillTag: "browsing_wifi",
    iconName: "Globe",
    estimatedMinutes: 20,
    lessonsCount: 3,
    scenariosCount: 8,
  },
  {
    id: "track-privacy",
    slug: "data-handling-and-privacy",
    title: "Data Handling, Privacy & PII Safeguards",
    description: "Protect sensitive corporate documents, handle PII securely under DPDP/GDPR, and prevent inadvertent data leaks.",
    skillTag: "data_privacy",
    iconName: "ShieldCheck",
    estimatedMinutes: 15,
    lessonsCount: 2,
    scenariosCount: 6,
  },
  {
    id: "track-incident-resp",
    slug: "incident-reporting-and-escalation",
    title: "Incident Reporting & Cyber Threat Escalation",
    description: "Learn how rapid reporting curtails breach damage, how to preserve digital evidence, and when to notify the SOC.",
    skillTag: "incident_response",
    iconName: "BellRing",
    estimatedMinutes: 15,
    lessonsCount: 2,
    scenariosCount: 6,
  },
];

export const SEED_LESSONS: Lesson[] = [
  // Track 1: Phishing
  {
    id: "lesson-phish-1",
    trackId: "track-phishing",
    title: "Anatomy of an Attack: Dissecting Deceptive Emails",
    orderIndex: 1,
    durationMinutes: 5,
    summary: "Understand how attackers forge display names, mimic domains, and induce panic to trigger impulsive clicks.",
    contentMarkdown: `### The Modern Phishing Anatomy

Phishing attacks have evolved far beyond poorly spelled Nigerian prince letters. Today's attackers leverage **Generative AI** to craft flawless, context-rich messages that mimic trusted suppliers, executive leadership, or utility agencies.

#### 1. Display Name Spoofing
Attackers often set the display name to a trusted executive or entity (e.g., *"Sundar Pichai <spichai-corp-update@gmail.com>"*). Email clients show the friendly name prominently while concealing the external mailbox address.

#### 2. Typosquatting and Homoglyph Domains
Look closely at the domain after the @ sign:
- \`microsoft.com\` vs \`micros0ft.com\` (zero instead of 'o')
- \`paypal.com\` vs \`paypaI.com\` (capital 'I' instead of 'l')
- Subdomain deception: \`accounts.google.com.attacker-controlled-server.com\`

#### 3. The Urgency Hook
Attackers want to hijack your **System 1 (fast, emotional) thinking** to bypass **System 2 (deliberate, analytical) reasoning**. Phrases like *"Account suspended in 2 hours"*, *"Immediate invoice payment required"*, or *"Missed delivery package"* are designed to make you act without checking.`,
    checkpoints: [
      {
        question: "When examining an email from an executive requesting urgent action, what is the most reliable element to verify?",
        options: [
          "The company logo and branding in the email body",
          "The actual sender email address domain and authenticated SPF/DKIM headers",
          "How polite and professional the tone of writing appears",
          "Whether the email arrived during normal business hours"
        ],
        correctIndex: 1,
        explanation: "Logos and professional tone are effortlessly copied by attackers. The authenticated domain and email header headers are the true ground truth."
      }
    ]
  },
  {
    id: "lesson-phish-2",
    trackId: "track-phishing",
    title: "Hyperlink Deception: The Hover Rule & QR-Code 'Quishing'",
    orderIndex: 2,
    durationMinutes: 6,
    summary: "Learn how to inspect destination URLs safely and protect against QR-code phishing on physical posters and emails.",
    contentMarkdown: `### Reading Links Like a Security Analyst

Never trust the blue underlined anchor text in an email or document. The text displayed can say \`https://secure.bank.com\` while the underlying HTML href directs to \`https://malicious-phish-portal.ru/login\`.

#### The Golden Hover Rule
Before clicking any link on desktop:
1. Hover your cursor over the link without clicking.
2. Inspect the preview URL rendered in the browser/email client status bar (usually bottom-left).
3. Read the domain from right to left starting from the first single forward slash (\`/\`):
   - Example: In \`https://login.microsoft.com.auth-service-verify.net/session\`, the true domain is **auth-service-verify.net**, NOT microsoft.com!

#### QR-Code Phishing ('Quishing')
Because email security gateways cannot easily scan images inside attachments, attackers embed QR codes prompting users to scan with their personal smartphones, bypassing corporate endpoint protections.
- **Rule**: Never scan a QR code received via email to log into an enterprise account or verify your identity.`,
    checkpoints: [
      {
        question: "In the URL 'https://support.amazon.com.order-tracking-update.com/signin', what is the actual destination domain host?",
        options: [
          "support.amazon.com",
          "amazon.com",
          "order-tracking-update.com",
          "signin"
        ],
        correctIndex: 2,
        explanation: "The domain is determined by the last two segments before the first path slash. 'support.amazon.com' is merely a deceptive prefix on 'order-tracking-update.com'."
      }
    ]
  },
  {
    id: "lesson-phish-3",
    trackId: "track-phishing",
    title: "Smishing & Messaging Traps: WhatsApp & SMS Security",
    orderIndex: 3,
    durationMinutes: 5,
    summary: "Recognize mobile phishing vectors, part-time job lures, fake courier updates, and malicious APK attachments.",
    contentMarkdown: `### The Vulnerability of Mobile Messaging

We trust our phones more than our desktops, and mobile notifications pop up with intimate proximity. Attackers exploit this with **Smishing** (SMS phishing) and **WhatsApp fraud**.

#### Common Smishing Playbooks
1. **The Utility Cutoff**: *"Your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Call 9876543210 immediately."*
2. **The Fake Courier**: *"Your India Post / BlueDart parcel couldn't be delivered due to wrong address. Update address within 12h."*
3. **The Part-Time Task Scam**: *"Earn ₹3,000 to ₹8,000 per day by rating hotels or liking YouTube videos from home."*
4. **Malicious APK Files**: Attackers disguise Android package files as wedding invitations (\`Shadi-Card.apk\`) or government updates. Installing them grants accessibility permissions and steals SMS OTPs.`,
    checkpoints: [
      {
        question: "You receive an SMS from a 10-digit mobile number stating your bank account is suspended and providing a shortened link. What should you do?",
        options: [
          "Click the link to check what documentation is required",
          "Reply 'STOP' to unsubscribe from the notifications",
          "Ignore and delete the SMS, or log in independently through the official bank app",
          "Call the 10-digit number back to verify their employee ID"
        ],
        correctIndex: 2,
        explanation: "Legitimate banks communicate via registered sender IDs (e.g., AD-HDFCBK), never personal 10-digit numbers. Always verify via the official app independently."
      }
    ]
  },

  // Track 3: UPI & Payments
  {
    id: "lesson-upi-1",
    trackId: "track-payments",
    title: "The Golden Rule of UPI: PIN is Only for DEBIT",
    orderIndex: 1,
    durationMinutes: 5,
    summary: "Understand the core protocol of Unified Payments Interface (UPI) to remain immune to 95% of digital payment scams.",
    contentMarkdown: `### The Golden Rule of UPI Architecture

In India's Unified Payments Interface (UPI) ecosystem, fraud almost universally relies on one fundamental misunderstanding: **how receiving money works**.

#### The Core Truth
> **You NEVER enter your UPI PIN to receive money.**
> **Entering your UPI PIN ALWAYS debits (removes) money from your bank account.**

#### The 'Collect Request' Trap
1. An attacker posing as a buyer on OLX, Facebook Marketplace, or rental portal agrees to buy your item.
2. They say: *"I am sending you ₹10,000 advance payment. Please accept it on Google Pay / PhonePe."*
3. Instead of sending money, they initiate a **COLLECT REQUEST** for ₹10,000.
4. If you tap "Pay" and enter your 4-digit or 6-digit PIN thinking you are 'confirming receipt', ₹10,000 is immediately debited from your account!`,
    checkpoints: [
      {
        question: "A buyer on OLX sends you a screenshot saying 'Payment Pending: Enter UPI PIN to receive funds'. What will happen if you enter your UPI PIN?",
        options: [
          "The funds will clear into your savings account within 5 minutes",
          "The money stated will be debited from your account into the scammer's wallet",
          "Your UPI app will automatically verify your KYC status",
          "The transaction will be canceled safely because it was a receipt request"
        ],
        correctIndex: 1,
        explanation: "Entering your UPI PIN authorizes an outgoing debit transaction. Money will leave your account immediately."
      }
    ]
  },
  {
    id: "lesson-upi-2",
    trackId: "track-payments",
    title: "QR Codes & Virtual Payment Address (VPA) Deceptions",
    orderIndex: 2,
    durationMinutes: 5,
    summary: "Detect weaponized QR codes, fake cashback scratch cards, and modified supplier invoice bank details.",
    contentMarkdown: `### QR Code Traps & Invoice Manipulation

#### 1. QR Code Reverse Traps
A QR code is simply a visual representation of a UPI link string (e.g., \`upi://pay?pa=scammer@okhdfcbank&pn=Merchant&am=5000\`).
- Scanning a QR code generated by someone else will **always take you to a payment screen**.
- Never scan a QR code sent to you over WhatsApp to 'receive a prize or deposit'.

#### 2. Supplier Invoice Fraud (Business Email Compromise)
In corporate settings, attackers compromise an external vendor's email mailbox and send an updated invoice:
- *"Notice of Banking Details Change: Due to our annual audit, please wire all upcoming payments to our new account at ICICI Bank."*
- **Mandatory Control**: Never alter supplier payment details without verbal confirmation via a pre-existing trusted telephone number.`,
    checkpoints: [
      {
        question: "Your regular IT equipment supplier emails an invoice with a note: 'Our bank account has changed, please send payment to the new account listed below'. What is the mandatory procedure?",
        options: [
          "Process payment immediately if the invoice template matches previous orders",
          "Reply to the email asking if they are sure the account changed",
          "Call the supplier's verified finance contact using a previously known phone number to verify",
          "Pay 10% as a test and see if it clears"
        ],
        correctIndex: 2,
        explanation: "Always conduct out-of-band verification using pre-established contact info. Replying to the compromised email just goes back to the attacker."
      }
    ]
  },

  // Track 4: Social Engineering & Deepfakes
  {
    id: "lesson-social-1",
    trackId: "track-social-eng",
    title: "AI Voice Cloning & Executive Pretexting",
    orderIndex: 1,
    durationMinutes: 6,
    summary: "How modern neural voice models clone voices from 3 seconds of audio, and the verbal protocols to stop them.",
    contentMarkdown: `### The Rise of Generative Voice Vishing

With modern AI tools (such as ElevenLabs, Tortoise, and open-source diffusion models), an attacker needs only 3 to 10 seconds of clear speech (harvested from YouTube videos, webinars, or public interviews) to clone a leader's voice with pitch-perfect realism.

#### Key Characteristics of a Vishing Attack
1. **Urgent Tone & Authority**: *"This is Rajesh, the Managing Director. I am in a confidential board meeting in London and we need to lock in this deal right now."*
2. **Channel Switching**: Callers often call on WhatsApp Audio or a private VOIP number instead of the office PBX.
3. **Secrecy Constraint**: *"Do not mention this to anyone in the office; it is under strict NDA until tomorrow morning."*

#### Defense Against Voice Clones
- **Operational Challenge Phrases**: Pre-agree on an internal verification phrase or question known only to team members (e.g., *"What was the mascot at our 2024 annual retreat?"*).
- **Callback Verification**: Hang up and call the executive back on their registered corporate number.`,
    checkpoints: [
      {
        question: "You receive an urgent phone call from someone who sounds exactly like your CEO asking you to immediately wire ₹25 Lakhs for a confidential acquisition. What should you do?",
        options: [
          "Execute the wire immediately because delaying could forfeit the corporate deal",
          "Politely disconnect and call the CEO back on their verified mobile number, and inform the CFO",
          "Ask them to text you on WhatsApp to have written confirmation",
          "Transfer half the requested amount to mitigate risk"
        ],
        correctIndex: 1,
        explanation: "AI voice clones sound indistinguishable from the real person. Always hang up and call back via trusted channels, and alert leadership."
      }
    ]
  }
];
