import { Scenario } from "@/lib/types";

export const VOICE_LOGIN_SCENARIOS: Scenario[] = [
  // 8 Voice Call / Vishing Scenarios
  {
    id: "scen-trai-digital-arrest-vishing",
    slug: "voice-trai-cbi-digital-arrest-extortion-call",
    title: "Voice Call: Cyber Crime Department - 'Digital Arrest Warrant'",
    channel: "VOICE_CALL",
    difficulty: "ADVANCED",
    skillTag: "social_eng",
    description: "An incoming call with authoritative background noise claiming your Aadhaar is linked to money laundering.",
    scenarioContent: {
      phoneCallerId: "+91 11 2338 9281 (Spoofed Delhi Police Header)",
      senderName: "Inspector Vijay Rathore (Cyber Cell Delhi)",
      body: `Automated Voice: "Press 9 to connect with Department of Telecommunications regarding immediate suspension of all mobile SIM cards issued under your Aadhaar."`,
      callTranscript: [
        { speaker: "caller", text: "I am Inspector Vijay Rathore from Delhi Cyber Crime Cell. Your Aadhaar number was found registered to 14 illegal SIM cards involved in money laundering.", delaySec: 0 },
        { speaker: "agent", text: "Sir, I have only one SIM card in my name. How can this happen?", delaySec: 3 },
        { speaker: "caller", text: "A formal FIR has been lodged by CBI Mumbai. The Supreme Court has issued an order for your immediate Digital Arrest under PMLA Act.", delaySec: 6 },
        { speaker: "caller", text: "You must remain on this video call, do not inform family, and transfer your account balance to the RBI Verification Clearing Vault to prove innocence.", delaySec: 10 },
      ],
    },
    redFlags: [
      {
        id: "rf-vishing-1-1",
        category: "REQUEST_TYPE",
        title: "The Fiction of 'Digital Arrest'",
        explanation: "There is NO legal concept of 'Digital Arrest' under Indian Law or Police Procedures. Law enforcement never interrogates or arrests people via Skype or video call.",
        severity: "CRITICAL",
      },
      {
        id: "rf-vishing-1-2",
        category: "PAYMENT_TRAP",
        title: "Transfer to 'RBI Secret Verification Account'",
        explanation: "The Reserve Bank of India does NOT maintain verification accounts for citizens. Any demand to transfer money to prove innocence is 100% fraud.",
        severity: "CRITICAL",
      },
      {
        id: "rf-vishing-1-3",
        category: "PSYCHOLOGICAL_URGENCY",
        title: "Isolation and Secrecy Mandate",
        explanation: "Forcing victims to stay isolated from friends, lawyers, and family ensures nobody can intervene.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Extraordinary composure! You refused to be intimidated by the fabricated 'Digital Arrest' terror tactic.",
    explanationOnFailure: "Fear of police arrest leads victims to transfer millions into criminal mule accounts.",
    whatToDoInstead: "Immediately disconnect the call. No police officer conducts video arrests or asks for money. Report immediately to Cyber Crime Helpline 1930.",
    isPublished: true,
    orderIndex: 55,
  },
  {
    id: "scen-voice-ai-ceo-acquisition",
    slug: "voice-ai-voice-cloned-managing-director-wire",
    title: "Voice Call: AI Voice-Cloned CEO Demands Urgent Acquisition Wire",
    channel: "VOICE_CALL",
    difficulty: "EXPERT",
    skillTag: "social_eng",
    description: "A phone call sounding identical to your Managing Director demanding an off-the-books bank wire.",
    scenarioContent: {
      phoneCallerId: "+44 20 7946 0912 (UK Roaming)",
      senderName: "Sundar Rajan (Managing Director - Voice Cloned)",
      body: `Incoming Call from Managing Director (Voice cloned via neural synthesis):`,
      callTranscript: [
        { speaker: "caller", text: "Alex! Can you hear me? I am in London at our investment bankers' office.", delaySec: 0 },
        { speaker: "agent", text: "Yes sir, I can hear you clearly. How can I help?", delaySec: 2 },
        { speaker: "caller", text: "We have an embargoed acquisition closing in 45 minutes. The seller requires a £120,000 good-faith deposit right now.", delaySec: 5 },
        { speaker: "caller", text: "Finance controller is unavailable. I need you to authorize the wire to Barclays Bank UK using our secondary treasury portal immediately.", delaySec: 8 },
        { speaker: "caller", text: "Do not message anyone on Slack because this deal is under strict regulatory NDA. I am counting on you.", delaySec: 12 },
      ],
    },
    redFlags: [
      {
        id: "rf-vishing-2-1",
        category: "AUTH_BYPASS",
        title: "AI Voice Cloning / Deepfake Synthesis",
        explanation: "Attackers clone executive voices from public webinars to bypass human identity verification over phone calls.",
        severity: "CRITICAL",
      },
      {
        id: "rf-vishing-2-2",
        category: "REQUEST_TYPE",
        title: "Emergency Out-of-Policy Financial Transfer",
        explanation: "Circumvents dual-authorization treasury policy under the guise of an executive emergency.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "ESCALATE_SOC",
    explanationOnSuccess: "Brilliant corporate security leadership! You recognized that voice audio cannot be trusted for financial movement without out-of-band verification.",
    explanationOnFailure: "Wiring funds based on voice calls alone is how major multinational firms have lost tens of millions to AI deepfake vishing.",
    whatToDoInstead: "Hang up, initiate a secondary verification via internal corporate callback, and escalate to the Chief Information Security Officer (CISO).",
    isPublished: true,
    orderIndex: 56,
  },
  {
    id: "scen-voice-bank-manager-card-block",
    slug: "voice-bank-manager-deactivated-debit-card-otp",
    title: "Voice Call: Bank Fraud Desk - 'Unauthorized ₹49,000 Amazon Charge'",
    channel: "VOICE_CALL",
    difficulty: "INTERMEDIATE",
    skillTag: "credentials",
    description: "A caller claiming an unauthorized charge of ₹49,000 is pending on your debit card right now.",
    scenarioContent: {
      phoneCallerId: "+91 22 6600 8812 (Mumbai Landline)",
      senderName: "Amitabh Verma (Bank Fraud Prevention Officer)",
      body: `Incoming Call:`,
      callTranscript: [
        { speaker: "caller", text: "Good afternoon, I am Amitabh Verma from HDFC Fraud Prevention. We have flagged an unauthorized transaction of ₹49,990 on Amazon India using your card ending in 4120.", delaySec: 0 },
        { speaker: "agent", text: "No, I did not make that purchase!", delaySec: 3 },
        { speaker: "caller", text: "Understood, we are blocking the transaction immediately. To verify you are the authorized cardholder, please read the 6-digit cancellation OTP sent to your phone.", delaySec: 6 },
      ],
    },
    redFlags: [
      {
        id: "rf-vishing-3-1",
        category: "AUTH_BYPASS",
        title: "Requesting OTP over Phone Call",
        explanation: "Banks NEVER ask for your OTP over the phone. The OTP is what authorizes the fraudulent transaction the attacker is currently attempting online.",
        severity: "CRITICAL",
      },
      {
        id: "rf-vishing-3-2",
        category: "PSYCHOLOGICAL_URGENCY",
        title: "Manufactured Emergency to Lower Guard",
        explanation: "Inventing an alarming ₹49,000 charge makes you feel the caller is trying to save you, inducing compliant OTP disclosure.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Perfect! You remembered that bank staff will NEVER ask for your OTP over a voice call.",
    explanationOnFailure: "Reading the OTP aloud allows the scammer to complete the transaction on their own terminal.",
    whatToDoInstead: "Hang up immediately. If concerned, call the toll-free number printed physically on the back of your debit card.",
    isPublished: true,
    orderIndex: 57,
  },
  {
    id: "scen-voice-telecom-sim-deactivation",
    slug: "voice-telecom-trai-sim-disconnection-ivr",
    title: "Voice Call: Automated IVR - 'All SIM Cards Will Be Blocked in 2 Hours'",
    channel: "VOICE_CALL",
    difficulty: "BEGINNER",
    skillTag: "social_eng",
    description: "An automated robocall warning that your phone service will be permanently cut off today.",
    scenarioContent: {
      phoneCallerId: "+91 98112 00012",
      senderName: "TRAI Regulatory IVR",
      body: `Robocall Audio Stream:`,
      callTranscript: [
        { speaker: "caller", text: "This is an important announcement from Telecom Regulatory Authority. Due to illegal marketing SMS violations, your mobile connection will be blocked within 2 hours.", delaySec: 0 },
        { speaker: "caller", text: "Press 1 to speak with customer resolution officer to avoid permanent telecom de-registration.", delaySec: 4 },
      ],
    },
    redFlags: [
      {
        id: "rf-vishing-4-1",
        category: "REQUEST_TYPE",
        title: "TRAI Robocall Threatening SIM Disconnection",
        explanation: "TRAI does NOT disconnect individual customer numbers or operate automated disconnection robocalls.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Spot on! Pressing 1 routes to fraudulent call centers that extort money through gift cards or digital payment traps.",
    explanationOnFailure: "Engaging with spam IVRs routes your call to high-pressure boiler-room extortionists.",
    whatToDoInstead: "Disconnect the call immediately and report the spam number on the TRAI DND (Do Not Disturb) app.",
    isPublished: true,
    orderIndex: 58,
  },
  {
    id: "scen-voice-it-support-anydesk-install",
    slug: "voice-it-helpdesk-malware-anydesk-remote-access",
    title: "Voice Call: Helpdesk - 'Trojan Detected on Your Work Laptop'",
    channel: "VOICE_CALL",
    difficulty: "INTERMEDIATE",
    skillTag: "browsing_wifi",
    description: "A caller claiming to be from Global Enterprise IT Helpdesk wanting to remotely access your laptop to remove a virus.",
    scenarioContent: {
      phoneCallerId: "Ext 8819 (Spoofed PBX)",
      senderName: "Kevin from Enterprise IT Support",
      body: `Desk Phone Call:`,
      callTranscript: [
        { speaker: "caller", text: "Hi Alex, this is Kevin from IT Security Helpdesk. Our SIEM telemetry is showing an active Trojan beacon communicating with a malicious Russian IP on your workstation.", delaySec: 0 },
        { speaker: "agent", text: "Oh no, what should I do?", delaySec: 3 },
        { speaker: "caller", text: "Please go to anydesk.com or teamviewer.com, download the client, and give me the 9-digit remote access address so I can purge the registry keys.", delaySec: 6 },
      ],
    },
    redFlags: [
      {
        id: "rf-vishing-5-1",
        category: "REQUEST_TYPE",
        title: "Unsolicited Remote Desktop Tool Download",
        explanation: "Corporate IT uses pre-installed enterprise tools (like Microsoft Quick Assist or enterprise EDR), never asking users to download consumer AnyDesk from public websites.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Great catch! Fraudulent IT support calls tricks users into installing remote-access software that steals corporate session cookies.",
    explanationOnFailure: "Granting remote desktop access hands over complete control of your workstation to attackers.",
    whatToDoInstead: "Hang up, open an internal ticket in your official IT service desk portal, and verify the technician's identity.",
    isPublished: true,
    orderIndex: 59,
  },
  {
    id: "scen-voice-credit-card-limit-increase",
    slug: "voice-credit-card-free-limit-increase-cvv",
    title: "Voice Call: Platinum Card Desk - 'Upgrade Limit from ₹2L to ₹8L'",
    channel: "VOICE_CALL",
    difficulty: "BEGINNER",
    skillTag: "credentials",
    description: "An agent offering an instant free credit limit boost on your card in exchange for verifying card details.",
    scenarioContent: {
      phoneCallerId: "+91 97112 33889",
      senderName: "Pooja (Credit Card Upgrade Department)",
      body: `Inbound Call:`,
      callTranscript: [
        { speaker: "caller", text: "Congratulations sir! Based on your excellent CIBIL score, your ICICI Credit Card limit has been approved for an instant upgrade from ₹2 Lakh to ₹8 Lakh with zero annual fees.", delaySec: 0 },
        { speaker: "caller", text: "To apply this enhancement on your card chip, please confirm your 16-digit card number and the 3-digit CVV on the back.", delaySec: 4 },
      ],
    },
    redFlags: [
      {
        id: "rf-vishing-6-1",
        category: "AUTH_BYPASS",
        title: "Asking for CVV & Card Number over Phone",
        explanation: "The CVV (Card Verification Value) is a secret security code. Banks already have your card number and will NEVER ask for CVV.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Correct! Giving your CVV over a phone call enables immediate fraudulent online shopping.",
    explanationOnFailure: "Sharing your CVV compromises your card completely.",
    whatToDoInstead: "Card limit enhancements are managed inside your official mobile banking app without disclosing card security codes.",
    isPublished: true,
    orderIndex: 60,
  },
  {
    id: "scen-voice-legit-bank-fraud-callback",
    slug: "voice-legitimate-bank-fraud-department-confirmation",
    title: "Voice Call: Legitimate Bank Automated Transaction Verification",
    channel: "VOICE_CALL",
    difficulty: "INTERMEDIATE",
    skillTag: "payments",
    description: "An automated fraud system asking you to confirm whether you just initiated an unusual transaction.",
    scenarioContent: {
      phoneCallerId: "+91 22 6600 6600 (Verified Bank IVR)",
      senderName: "Axis Bank Automated Fraud Alert",
      body: `Automated Call:`,
      callTranscript: [
        { speaker: "caller", text: "This is an automated security verification call from Axis Bank. Did you just attempt a transaction of ₹12,400 at Apple Store Online? Press 1 if you authorized this, Press 2 if you did NOT authorize.", delaySec: 0 },
        { speaker: "caller", text: "Note: We will NEVER ask you for your PIN, CVV, or NetBanking password.", delaySec: 4 },
      ],
    },
    redFlags: [],
    correctAction: "IGNORE_SAFE",
    explanationOnSuccess: "Accurate! Notice the crucial distinction: legitimate automated fraud calls NEVER ask for your PIN, password, or CVV.",
    explanationOnFailure: "Legitimate automated verification systems ask simple Yes/No confirmations without soliciting secret credentials.",
    whatToDoInstead: "If you recognize the transaction, press 1. If not, press 2 to block the card, or call the bank customer care independently.",
    isPublished: true,
    orderIndex: 61,
  },
  {
    id: "scen-voice-courier-narcotics-customs",
    slug: "voice-fedex-customs-officer-illegal-parcel-seizure",
    title: "Voice Call: FedEx Security - 'Passport & MDMA Discovered in Parcel'",
    channel: "VOICE_CALL",
    difficulty: "ADVANCED",
    skillTag: "social_eng",
    description: "A caller claiming to be from FedEx courier dispatch stating customs found illegal items in your package.",
    scenarioContent: {
      phoneCallerId: "+91 99221 00192",
      senderName: "FedEx International Clearance Agent",
      body: `Inbound Call:`,
      callTranscript: [
        { speaker: "caller", text: "Hello, this is FedEx Security Mumbai Hub. A parcel sent under your Aadhaar to Singapore containing 5 expired passports and white powder contraband has been intercepted by customs.", delaySec: 0 },
        { speaker: "agent", text: "I have never sent any parcel to Singapore!", delaySec: 3 },
        { speaker: "caller", text: "Then your identity has been stolen by organized crime syndicates. I am transferring your call to Crime Branch Inspector Sharma for urgent recording of statement.", delaySec: 6 },
      ],
    },
    redFlags: [
      {
        id: "rf-vishing-8-1",
        category: "PSYCHOLOGICAL_URGENCY",
        title: "Courier Direct Transfer to 'Police' Scam",
        explanation: "Courier companies cannot magically transfer your phone call to government police departments. This is a staged two-person scam syndicate.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Brilliant! You saw through the fake courier-to-police call transfer theater.",
    explanationOnFailure: "Believing the transfer hooks you into paying extortion money to avoid fake criminal prosecution.",
    whatToDoInstead: "Hang up immediately. Legitimate couriers do not act as police switchboards.",
    isPublished: true,
    orderIndex: 62,
  },

  // 6 Fake Login Page Spotter Scenarios
  {
    id: "scen-login-microsoft-oauth-consent",
    slug: "fake-login-microsoft-365-oauth-consent-grant",
    title: "Login Spotter: Microsoft 365 OAuth 'Permissions Requested'",
    channel: "FAKE_LOGIN",
    difficulty: "EXPERT",
    skillTag: "credentials",
    description: "An authentic-looking Microsoft OAuth consent screen asking to grant an application full mailbox read permissions.",
    scenarioContent: {
      fakeLoginPageUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=98218-fake&scope=Mail.ReadWrite%20Offline_Access",
      fakeLoginBrandedCompany: "Microsoft 365 Enterprise Portal",
      body: `Microsoft
Permissions Requested:
'Corporate Document Sync Tool'
• Read and write your mailboxes
• Maintain access to data you have given it access to
• Read all files that user can access
[Cancel] [Accept]`,
    },
    redFlags: [
      {
        id: "rf-login-1-1",
        category: "AUTH_BYPASS",
        title: "Illicit Consent Grant (OAuth Phishing)",
        explanation: "An attacker-registered app requests 'Mail.ReadWrite' and 'Offline_Access'. Granting consent gives the attacker perpetual token access to your email without needing your password or MFA!",
        severity: "CRITICAL",
      },
      {
        id: "rf-login-1-2",
        category: "REQUEST_TYPE",
        title: "Unverified Publisher Warning",
        explanation: "The application displays 'Unverified Publisher: dev-tools-saas.biz'.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Spectacular expertise! Illicit Consent Grant attacks bypass passwords and MFA completely by tricking users into authorizing malicious OAuth enterprise apps.",
    explanationOnFailure: "Clicking 'Accept' generates an enterprise access token granting attackers continuous access to your emails.",
    whatToDoInstead: "Click 'Cancel' and alert your IT/Security team to block and audit the malicious OAuth client ID.",
    isPublished: true,
    orderIndex: 63,
  },
  {
    id: "scen-login-google-workspace-homograph",
    slug: "fake-login-google-workspace-homoglyph-portal",
    title: "Login Spotter: Google Workspace Login (Homoglyph Domain)",
    channel: "FAKE_LOGIN",
    difficulty: "INTERMEDIATE",
    skillTag: "browsing_wifi",
    description: "A login page designed to look exactly like Google Workspace sign-in with a subtle homoglyph character in the URL bar.",
    scenarioContent: {
      fakeLoginPageUrl: "https://accounts.googIe.com/signin/v2/identifier",
      fakeLoginBrandedCompany: "Google Workspace",
      body: `Google
Sign in with your Google Account
[Email or phone: alex.mercer@enterprise.org]
[Next]`,
    },
    redFlags: [
      {
        id: "rf-login-2-1",
        category: "URL",
        title: "Homoglyph Character Substitution ('googIe.com')",
        explanation: "Look very closely at the domain: 'googIe.com' uses a capital letter 'I' (eye) instead of a lowercase 'l' (el). The true domain is NOT google.com!",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Eagle eye! Spotting the capital 'I' substituted for 'l' in 'googIe.com' is exceptional domain inspection.",
    explanationOnFailure: "Typing your password on a homoglyph domain delivers your credentials straight to an adversary-in-the-middle proxy.",
    whatToDoInstead: "Never log in on URLs with anomalous letter casing. Use password managers, which refuse to autofill on spoofed domains.",
    isPublished: true,
    orderIndex: 64,
  },
  {
    id: "scen-login-cisco-vpn-portal-phish",
    slug: "fake-login-cisco-anyconnect-vpn-ssl-portal",
    title: "Login Spotter: Corporate Cisco AnyConnect VPN Web Portal",
    channel: "FAKE_LOGIN",
    difficulty: "ADVANCED",
    skillTag: "browsing_wifi",
    description: "A spoofed corporate VPN portal attempting to steal enterprise Active Directory logins.",
    scenarioContent: {
      fakeLoginPageUrl: "https://vpn.enterprise-global-access.net/+CSCOE+/logon.html",
      fakeLoginBrandedCompany: "Cisco AnyConnect Secure Mobility Client",
      body: `Cisco Systems, Inc.
SSL VPN Service
Group: [Corporate-Staff-SSL-VPN]
Username: [alex.mercer]
Password: [••••••••••••]
MFA Push Code: [      ]
[Login]`,
    },
    redFlags: [
      {
        id: "rf-login-3-1",
        category: "URL",
        title: "External Domain for Corporate VPN Gateway",
        explanation: "The company's authentic VPN gateway is 'vpn.enterprise.org'. The phishing page is hosted on 'enterprise-global-access.net'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-login-3-2",
        category: "AUTH_BYPASS",
        title: "Real-time Adversary-in-the-Middle (AiTM) Proxy",
        explanation: "Harvests both password and MFA push token concurrently.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Incredible awareness! Adversaries commonly clone VPN landing portals to breach internal corporate perimeters.",
    explanationOnFailure: "Entering corporate credentials on an external VPN portal yields full internal network access to attackers.",
    whatToDoInstead: "Connect only through the pre-installed desktop VPN client rather than ad-hoc browser links.",
    isPublished: true,
    orderIndex: 65,
  },
  {
    id: "scen-login-sbi-netbanking-portal",
    slug: "fake-login-state-bank-of-india-onlinesbi-spoof",
    title: "Login Spotter: State Bank of India Retail NetBanking Portal",
    channel: "FAKE_LOGIN",
    difficulty: "INTERMEDIATE",
    skillTag: "credentials",
    description: "A clone of State Bank of India's retail login portal with an invalid SSL certificate badge.",
    scenarioContent: {
      fakeLoginPageUrl: "http://onlinesbi.sbi-retail-login.co.in/portal/login.htm",
      fakeLoginBrandedCompany: "State Bank of India (OnlineSBI)",
      body: `State Bank of India
Personal Banking
Username: [                  ]
Password: [                  ]
Captcha:  [ 4 X 9 B K ]
[Login]`,
    },
    redFlags: [
      {
        id: "rf-login-4-1",
        category: "URL",
        title: "Unencrypted HTTP Protocol (http://) & Spoofed Domain",
        explanation: "Authentic SBI NetBanking strictly runs on https://onlinesbi.sbi with EV SSL. This site runs on unencrypted 'http://' on 'sbi-retail-login.co.in'.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Flawless inspection! The lack of HTTPS encryption and the fake domain '.co.in' were dead giveaways.",
    explanationOnFailure: "Submitting bank credentials on unencrypted or spoofed HTTP portals leads to immediate account compromise.",
    whatToDoInstead: "Always verify the address bar displays https://onlinesbi.sbi and check for the authentic security certificate.",
    isPublished: true,
    orderIndex: 66,
  },
  {
    id: "scen-login-github-personal-access-token",
    slug: "fake-login-github-device-flow-token-stealer",
    title: "Login Spotter: GitHub Developer Device Activation Portal",
    channel: "FAKE_LOGIN",
    difficulty: "ADVANCED",
    skillTag: "credentials",
    description: "A page mimicking GitHub's Device Flow login prompting for an 8-digit device code.",
    scenarioContent: {
      fakeLoginPageUrl: "https://github.com.device-activation-auth.io/login/device",
      fakeLoginBrandedCompany: "GitHub, Inc.",
      body: `GitHub
Device Activation
Enter the code shown on your CLI or TV screen:
[ XXXX - XXXX ]
[Continue to Sign In]`,
    },
    redFlags: [
      {
        id: "rf-login-5-1",
        category: "URL",
        title: "Deceptive Subdomain Host (.device-activation-auth.io)",
        explanation: "The legitimate URL is github.com/login/device. This page is hosted on 'device-activation-auth.io'.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Superb catch! Attackers exploit the OAuth device flow to hijack developer GitHub access tokens.",
    explanationOnFailure: "Approving malicious device authorization gives attackers access to private source code repositories.",
    whatToDoInstead: "Navigate directly to github.com/login/device without clicking external links.",
    isPublished: true,
    orderIndex: 67,
  },
  {
    id: "scen-login-legit-microsoft-live",
    slug: "fake-login-legitimate-microsoft-login-live-portal",
    title: "Login Spotter: Authentic Microsoft Login Portal (login.microsoftonline.com)",
    channel: "FAKE_LOGIN",
    difficulty: "BEGINNER",
    skillTag: "credentials",
    description: "The genuine, authentic Microsoft identity authentication gateway with valid SSL EV certificate.",
    scenarioContent: {
      fakeLoginPageUrl: "https://login.microsoftonline.com/common/login",
      fakeLoginBrandedCompany: "Microsoft Corporation",
      body: `Microsoft
Sign in
alex.mercer@enterprise.org
[Next]
Terms of use  Privacy & cookies`,
    },
    redFlags: [],
    correctAction: "ENTER_CREDENTIALS",
    explanationOnSuccess: "Accurate! The domain 'login.microsoftonline.com' over HTTPS with valid certificates is the authentic Microsoft login portal.",
    explanationOnFailure: "Refusing to log into the genuine corporate authentication portal prevents legitimate access to work resources.",
    whatToDoInstead: "Verify the URL matches https://login.microsoftonline.com and proceed with authorized authentication.",
    isPublished: true,
    orderIndex: 68,
  },
];
