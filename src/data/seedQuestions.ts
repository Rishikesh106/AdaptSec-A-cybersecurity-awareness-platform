import { Question } from "@/lib/types";

export const SEED_QUESTIONS: Question[] = [
  {
    id: "q-phish-domain-check",
    type: "MCQ",
    skillTag: "phishing",
    difficulty: "BEGINNER",
    prompt: "You receive an email from 'support@amaz0n-security-alert.net' claiming your account was compromised. What is the key indicator that this is a phishing email?",
    options: [
      { id: "o1", text: "The message is sent over TLS encryption", isCorrect: false },
      { id: "o2", text: "The domain 'amaz0n-security-alert.net' uses typosquatting (number '0' instead of 'o') and is not amazon.com", isCorrect: true, feedback: "Correct! Legitimate amazon emails will only originate from @amazon.com or authorized subdomains." },
      { id: "o3", text: "The email has a professional subject line", isCorrect: false },
      { id: "o4", text: "It was delivered directly to your primary inbox", isCorrect: false },
    ],
    explanation: "Attackers commonly register domain names with minor character substitutions like 0 for O or I for l to trick hurried readers."
  },
  {
    id: "q-upi-pin-rules",
    type: "MCQ",
    skillTag: "payments",
    difficulty: "BEGINNER",
    prompt: "Under what circumstance are you required to enter your 4-digit or 6-digit UPI PIN when someone transfers money to you?",
    options: [
      { id: "o1", text: "Only when the amount is greater than ₹10,000", isCorrect: false },
      { id: "o2", text: "When accepting money from a new contact for the first time", isCorrect: false },
      { id: "o3", text: "NEVER. You only enter your UPI PIN to SEND or DEBIT money from your bank account", isCorrect: true, feedback: "Correct! The UPI protocol strictly requires PIN entry for debits only. Receiving funds requires zero PIN input." },
      { id: "o4", text: "When using Google Pay or PhonePe cashback rewards", isCorrect: false },
    ],
    explanation: "Remember this universal rule of UPI: 'PIN = Paisa Jana' (PIN means money leaving). You never enter a PIN to receive payments."
  },
  {
    id: "q-password-strength-concept",
    type: "MCQ",
    skillTag: "credentials",
    difficulty: "BEGINNER",
    prompt: "Which of the following approaches yields the highest resistance to modern GPU-based brute-force cracking?",
    options: [
      { id: "o1", text: "A 8-character complex password like 'P@$$w0rd'", isCorrect: false, feedback: "Short passwords with standard leetspeak substitutions are cracked in seconds by GPU dictionary attacks." },
      { id: "o2", text: "A 18-character memorable passphrase like 'velvet-cobalt-falcon-orbit'", isCorrect: true, feedback: "Spot on! Length provides exponential entropy. An 18-character passphrase takes trillions of centuries to brute force." },
      { id: "o3", text: "Reusing the same strong password with a different number at the end for each site", isCorrect: false },
      { id: "o4", text: "Writing down your password on a sticky note attached to your monitor", isCorrect: false },
    ],
    explanation: "Passphrase length expands mathematical entropy exponentially (\(C^L\)). 4 random words separated by hyphens are far stronger and easier to remember than short mutated strings."
  },
  {
    id: "q-mfa-fatigue-defense",
    type: "MCQ",
    skillTag: "credentials",
    difficulty: "INTERMEDIATE",
    prompt: "At 2:00 AM, you suddenly receive 15 consecutive Microsoft Authenticator push approval prompts on your phone. What should you do?",
    options: [
      { id: "o1", text: "Tap 'Approve' on one of them so the notifications stop chiming", isCorrect: false },
      { id: "o2", text: "Deny the prompt, change your corporate password immediately, and alert the SOC/IT team of an MFA fatigue attack", isCorrect: true, feedback: "Excellent decision. This is an active MFA fatigue/push-bombing attack meaning your primary password was compromised." },
      { id: "o3", text: "Put your phone in airplane mode and deal with it next Monday", isCorrect: false },
      { id: "o4", text: "Assume it's an automated system backup test", isCorrect: false },
    ],
    explanation: "MFA push bombing occurs when an attacker with stolen credentials floods the user with push prompts hoping for accidental or irritated compliance."
  },
  {
    id: "q-deepfake-vishing-protocol",
    type: "SCENARIO_BASED",
    skillTag: "social_eng",
    difficulty: "INTERMEDIATE",
    prompt: "A caller claiming to be your corporate VP calls your desk from an unknown number. The voice sounds genuine, but they demand an urgent wire transfer bypassing approval gates due to an 'embargoed M&A deal'. What is the correct protocol?",
    options: [
      { id: "o1", text: "Comply immediately because questioning executives can damage your career", isCorrect: false },
      { id: "o2", text: "Transfer 50% as a demonstration of cooperation", isCorrect: false },
      { id: "o3", text: "Politely state company policy, hang up, and call the VP back on their verified directory number or use an out-of-band verification challenge", isCorrect: true, feedback: "Perfect response. AI voice cloning can replicate executive voices in seconds. Out-of-band callbacks stop the attack in its tracks." },
      { id: "o4", text: "Ask them to email you from their personal Gmail account", isCorrect: false },
    ],
    explanation: "Verification must always happen out-of-band via trusted internal directories, never using contact info supplied during an inbound unsolicited call."
  },
  {
    id: "q-public-wifi-risks",
    type: "MULTI_SELECT",
    skillTag: "browsing_wifi",
    difficulty: "INTERMEDIATE",
    prompt: "When connecting to an open, unencrypted Wi-Fi network at an airport or coffee shop, which TWO precautions should you always practice?",
    options: [
      { id: "o1", text: "Enable an enterprise VPN (Virtual Private Network) immediately", isCorrect: true },
      { id: "o2", text: "Turn off file and folder sharing on your device OS", isCorrect: true },
      { id: "o3", text: "Accept all SSL certificate warning bypass popups", isCorrect: false },
      { id: "o4", text: "Conduct sensitive corporate banking transactions immediately before the session times out", isCorrect: false },
    ],
    explanation: "A VPN encrypts all packet payloads preventing local MITM snooping, and disabling OS sharing prevents network-level discovery and lateral probing."
  },
  {
    id: "q-incident-reporting-speed",
    type: "MCQ",
    skillTag: "incident_response",
    difficulty: "BEGINNER",
    prompt: "You accidentally entered your corporate email and password on a realistic-looking phishing login page before realizing the URL was fake. What should you do first?",
    options: [
      { id: "o1", text: "Wait 24 hours to see if any unusual activity occurs on your account", isCorrect: false },
      { id: "o2", text: "Immediately change your password, notify your Security/IT team, and report the phishing link", isCorrect: true, feedback: "Correct! Rapid notification allows the SOC to revoke active session tokens and block the attacker's IP before data exfiltration occurs." },
      { id: "o3", text: "Delete your browser history and keep quiet to avoid disciplinary trouble", isCorrect: false },
      { id: "o4", text: "Turn off your monitor and restart your laptop", isCorrect: false },
    ],
    explanation: "Security teams value fast reporting above all else. Early incident containment prevents a single credential loss from escalating into a full domain breach."
  },
  {
    id: "q-data-handling-pii",
    type: "MCQ",
    skillTag: "data_privacy",
    difficulty: "INTERMEDIATE",
    prompt: "Under data privacy frameworks like India's DPDP Act and GDPR, what must you do before uploading customer PAN/Aadhaar/passport documents to a public generative AI chat tool?",
    options: [
      { id: "o1", text: "It is always safe to upload customer data if the AI tool claims to be private", isCorrect: false },
      { id: "o2", text: "Never upload unredacted PII or confidential company data to public AI tools without authorized enterprise data protection agreements and explicit consent", isCorrect: true, feedback: "Correct! Public LLMs may incorporate input prompts into model retraining or log them, violating data sovereignty and privacy mandates." },
      { id: "o3", text: "Only upload customer data between 9 AM and 5 PM", isCorrect: false },
      { id: "o4", text: "Change the file extension from .pdf to .txt first", isCorrect: false },
    ],
    explanation: "Customer personal identifiable information (PII) must never be pasted or uploaded into consumer-grade public cloud tools without enterprise boundary guarantees."
  }
];
