import { ScamOfTheWeekItem } from "@/lib/types";

export const SEED_THREAT_FEED: ScamOfTheWeekItem[] = [
  {
    id: "scam-trai-digital-arrest",
    title: "The 'Digital Arrest' & Fake Cyber Cell Video Extortion",
    category: "Impersonation / Vishing",
    channel: "VOICE_CALL",
    threatLevel: "CRITICAL",
    date: "November 2026",
    summary: "Scammers pose as CBI/ED/TRAI officials threatening victim with an illegal courier containing contraband, demanding Skype 'Digital Arrest' and fund transfers.",
    realWorldIncident: "Over ₹120 Crore lost by citizens in Q3 2026 across urban metro cities through elaborate fake police station sets on video calls.",
    keyIndicators: [
      "Claims of 'Digital Arrest' (no law enforcement agency has any legal concept of digital arrest)",
      "Demands to stay on continuous video call or isolate yourself from family",
      "Demands transferring money to 'RBI verification accounts' for clearance",
      "Official-looking fake arrest warrants sent over WhatsApp"
    ],
    preventiveAdvice: "Law enforcement never conducts arrests over Skype or WhatsApp. Never transfer money to verify innocence. Disconnect and report immediately to national cyber helpline 1930.",
    simulationScenarioId: "scen-trai-digital-arrest-vishing"
  },
  {
    id: "scam-electricity-bill-apk",
    title: "Disconnection Warning SMS with Malicious APK Attachment",
    category: "Smishing / Mobile Malware",
    channel: "SMS",
    threatLevel: "HIGH",
    date: "October 2026",
    summary: "Urgent SMS claiming power supply will be cut tonight at 9:30 PM due to unpaid bill; directs user to call a 10-digit mobile number or install 'Bijli-Update.apk'.",
    realWorldIncident: "Widespread campaigns impersonating BSES, TNEB, MSEDCL, and BESCOM affecting thousands of residential and commercial subscribers.",
    keyIndicators: [
      "Sent from regular +91 mobile numbers rather than registered corporate 6-character sender headers (e.g. 'VK-BESCOM')",
      "Artificial urgency: 'Electricity will be disconnected at 9:30 PM tonight'",
      "Instructs victim to install an APK file from third-party links or download QuickSupport/AnyDesk",
      "Requests ₹10 token recharge to test payment which steals banking credentials"
    ],
    preventiveAdvice: "Official utility providers communicate bill statuses via registered sender IDs and official utility portals. Never install APK files from SMS links.",
    simulationScenarioId: "scen-sms-electricity-bill-apk"
  },
  {
    id: "scam-ai-ceo-deepfake-voice",
    title: "AI Voice-Cloned CEO Urgent Overseas Acquisition Call",
    category: "AI Vishing / BEC",
    channel: "VOICE_CALL",
    threatLevel: "CRITICAL",
    date: "November 2026",
    summary: "Finance controller receives a phone call with the exact voice cadence of the Managing Director demanding immediate confidential wire transfer.",
    realWorldIncident: "Multi-million dollar loss at an engineering multinational when an audio deepfake simulated executive voice over WhatsApp audio.",
    keyIndicators: [
      "Extreme emotional urgency requesting bypass of standard 2-person authorization protocols",
      "Strict confidentiality demand: 'Do not discuss this with the team until regulatory filings close'",
      "Incoming call via messaging app rather than corporate internal phone extension",
      "Refusal or evasion when asked out-of-band operational challenge questions"
    ],
    preventiveAdvice: "Always enforce out-of-band dual authorization for any financial movement, using pre-established secret passphrases or in-person callback.",
    simulationScenarioId: "scen-voice-ai-ceo-acquisition"
  },
  {
    id: "scam-olx-qr-receive-money",
    title: "Buyer 'Scan QR Code to Receive Payment' UPI Scam",
    category: "UPI / Financial Fraud",
    channel: "UPI",
    threatLevel: "HIGH",
    date: "October 2026",
    summary: "Buyer on second-hand marketplace offers advance payment via UPI QR code. Scanning the code prompts for victim's UPI PIN.",
    realWorldIncident: "Continues to be one of the top 3 reported UPI fraud vectors on National Cyber Crime Reporting Portal.",
    keyIndicators: [
      "QR code says 'Scan to receive payment ₹15,000'",
      "Victim is told: 'Enter your 4-digit or 6-digit UPI PIN to credit your bank account'",
      "UPI PIN is ONLY required to DEBIT money from your bank account, NEVER to receive money",
      "Buyer displays aggressive eagerness without inspecting goods"
    ],
    preventiveAdvice: "Rule of Gold: You NEVER enter your UPI PIN to receive money. Receiving funds requires only your mobile number or VPA.",
    simulationScenarioId: "scen-upi-olx-buyer-qr"
  }
];
