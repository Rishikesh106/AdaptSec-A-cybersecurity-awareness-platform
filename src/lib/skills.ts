export interface SkillMeta {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  color: string;
  accentHex: string;
  iconName: string;
  benchmarkScore: number;
}

export const SKILL_CATEGORIES: Record<string, SkillMeta> = {
  phishing: {
    id: "phishing",
    name: "Phishing & Smishing Detection",
    shortName: "Phishing",
    description: "Identifying deceptive emails, spoofed sender domains, urgency hooks, and malicious SMS links.",
    category: "Communication Security",
    color: "from-cyan-500 to-blue-600",
    accentHex: "#00f0ff",
    iconName: "MailWarning",
    benchmarkScore: 80,
  },
  credentials: {
    id: "credentials",
    name: "Credential & MFA Hygiene",
    shortName: "Credentials",
    description: "Creating resilient passphrases, thwarting credential stuffing, avoiding reuse, and defending against MFA fatigue.",
    category: "Identity Protection",
    color: "from-amber-500 to-orange-600",
    accentHex: "#ffb703",
    iconName: "KeyRound",
    benchmarkScore: 85,
  },
  payments: {
    id: "payments",
    name: "Payment, UPI & Invoice Fraud",
    shortName: "Payments",
    description: "Detecting UPI collect request traps, QR-code phishing, supplier invoice manipulation, and fake refunds.",
    category: "Financial Defense",
    color: "from-emerald-500 to-teal-600",
    accentHex: "#00ff88",
    iconName: "CreditCard",
    benchmarkScore: 80,
  },
  social_eng: {
    id: "social_eng",
    name: "Social Engineering & Deepfake Voice",
    shortName: "Social Eng",
    description: "Spotting executive impersonation, urgent authority demands, voice clone vishing calls, and pretexting.",
    category: "Human Defense",
    color: "from-purple-500 to-pink-600",
    accentHex: "#ff007f",
    iconName: "UserCheck",
    benchmarkScore: 75,
  },
  browsing_wifi: {
    id: "browsing_wifi",
    name: "Safe Browsing & Public Wi-Fi",
    shortName: "Browsing",
    description: "Navigating rogue access points, untrusted TLS certs, typosquatting domains, and drive-by downloads.",
    category: "Network Defense",
    color: "from-sky-500 to-indigo-600",
    accentHex: "#38bdf8",
    iconName: "Globe",
    benchmarkScore: 80,
  },
  data_privacy: {
    id: "data_privacy",
    name: "Data Handling & Privacy Safeguards",
    shortName: "Data Privacy",
    description: "Preventing inadvertent data leaks, respecting PII/GDPR/DPDP rules, and sanitizing shared files.",
    category: "Information Governance",
    color: "from-indigo-500 to-violet-600",
    accentHex: "#818cf8",
    iconName: "ShieldCheck",
    benchmarkScore: 85,
  },
  incident_response: {
    id: "incident_response",
    name: "Incident Reporting & Threat Escalation",
    shortName: "Incident Resp",
    description: "Knowing when, how, and where to report suspicious indicators before breaches propagate.",
    category: "Resilience",
    color: "from-rose-500 to-red-600",
    accentHex: "#ff3366",
    iconName: "BellRing",
    benchmarkScore: 80,
  },
};

export const ALL_SKILL_IDS = Object.keys(SKILL_CATEGORIES);
