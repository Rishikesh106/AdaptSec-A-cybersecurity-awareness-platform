import { Scenario } from "@/lib/types";

export const INBOX_SCENARIOS: Scenario[] = [
  {
    id: "scen-inbox-microsoft-password-reset",
    slug: "microsoft-365-urgent-password-reset",
    title: "Urgent Microsoft 365 Password Expiration Notice",
    channel: "INBOX",
    difficulty: "BEGINNER",
    skillTag: "phishing",
    description: "An email mimicking Microsoft IT notifying you that your domain password expires in 2 hours.",
    scenarioContent: {
      subject: "Action Required: Your Microsoft 365 Password Expires Today",
      senderName: "Microsoft 365 Security Team",
      senderAddress: "no-reply@security-alerts-msft365.com",
      senderDomain: "security-alerts-msft365.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Dear Alex,

Your Microsoft 365 corporate login password is scheduled to expire in 2 hours. To maintain uninterrupted access to Outlook, OneDrive, and Microsoft Teams, you must retain your current password immediately.

Failure to verify within the deadline will result in an automated account lock and loss of unsaved cloud documents.

Click below to verify and keep your current password active:
Keep My Password Active

Regards,
Microsoft Cloud Security Administration
Ref: MSFT-AUTH-99281`,
      links: [
        {
          anchor: "Keep My Password Active",
          actualUrl: "https://login.microsoft.com.auth-sync-gateway.net/renew-password",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-1-1",
        category: "SENDER",
        title: "Unofficial Sender Domain",
        explanation: "The sender address is 'security-alerts-msft365.com' instead of authentic 'microsoft.com'.",
        severity: "HIGH",
      },
      {
        id: "rf-inbox-1-2",
        category: "URL",
        title: "Homograph / Subdomain Deception",
        explanation: "The destination URL has 'login.microsoft.com' as a subdomain on 'auth-sync-gateway.net'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-1-3",
        category: "PSYCHOLOGICAL_URGENCY",
        title: "Artificial 2-Hour Lockout Panic",
        explanation: "Induces fear of losing access within 2 hours to bypass critical evaluation.",
        severity: "MEDIUM",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Great catch! You spotted the deceptive domain 'auth-sync-gateway.net' and the unauthenticated external sender address.",
    explanationOnFailure: "You fell for the urgency hook. Hovering over the button reveals that the link does not go to microsoft.com, but to an attacker-controlled credential harvester.",
    whatToDoInstead: "Always inspect the actual destination domain by hovering over links. Forward such emails to your internal security/SOC team or use the Report Phishing button in your mail client.",
    isPublished: true,
    orderIndex: 1,
  },
  {
    id: "scen-inbox-docusign-confidential-nda",
    slug: "docusign-confidential-nda-homograph",
    title: "DocuSign: Confidential Executive NDA Pending Signature",
    channel: "INBOX",
    difficulty: "INTERMEDIATE",
    skillTag: "phishing",
    description: "A signature request appearing to come from DocuSign regarding an executive bonus structure.",
    scenarioContent: {
      subject: "DocuSign: Please review and sign Executive NDA & Retention Agreement",
      senderName: "DocuSign Trust Center",
      senderAddress: "dse_service@docusign-documents-verify.net",
      senderDomain: "docusign-documents-verify.net",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `All parties have signed the Executive Compensation & Retention Addendum.

Please review and complete the signing session:
Review Document in Secure Cloud

Alternative Signing Access:
Security Code: 994-DOC-821
Powered by DocuSign Ink.

Confidentiality Notice: This document contains proprietary salary and organizational restructure data.`,
      links: [
        {
          anchor: "Review Document in Secure Cloud",
          actualUrl: "https://na3.docusign.com.doc-storage-portal.com/signing/auth",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-2-1",
        category: "SENDER",
        title: "Forged DocuSign Domain",
        explanation: "Official DocuSign notifications always originate from @docusign.net or @docusign.com.",
        severity: "HIGH",
      },
      {
        id: "rf-inbox-2-2",
        category: "URL",
        title: "Spoofed Cloud Link",
        explanation: "The link leads to 'doc-storage-portal.com', not DocuSign.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-2-3",
        category: "PSYCHOLOGICAL_URGENCY",
        title: "Greed / Curiosity Pretext",
        explanation: "Mentions 'Executive Compensation' to entice the recipient to click without caution.",
        severity: "MEDIUM",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Flawless detection! DocuSign signature emails never originate from third-party domains like 'docusign-documents-verify.net'.",
    explanationOnFailure: "The promise of confidential executive compensation lured you into clicking a phishing link that steals session cookies.",
    whatToDoInstead: "If expecting a DocuSign document, navigate independently to docusign.com and enter the document security code in the official search portal.",
    isPublished: true,
    orderIndex: 2,
  },
  {
    id: "scen-inbox-bec-vendor-invoice-change",
    slug: "bec-vendor-bank-account-change",
    title: "Apex Logistics: Urgent Change of Banking Details for Invoice #4892",
    channel: "INBOX",
    difficulty: "ADVANCED",
    skillTag: "payments",
    description: "An email from a known corporate vendor announcing a sudden change in bank account details.",
    scenarioContent: {
      subject: "RE: Overdue Invoice #4892 - Apex Logistics New Remittance Instructions",
      senderName: "Priya Sharma (Apex Logistics Accounts)",
      senderAddress: "priya.sharma@apexlogistics-co.in",
      senderDomain: "apexlogistics-co.in",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Hi Alex,

Following up on our invoice #4892 (₹4,85,000) due this Friday.

Please note that our primary account with Axis Bank is currently undergoing an annual regulatory audit. Therefore, all pending remittance wires must be directed to our new ICICI Bank corporate account:

Beneficiary: Apex Logistics Private Limited
Account Number: 928301982736
IFSC: ICIC0001829
Branch: Nariman Point, Mumbai

Please confirm the remittance slip once processed to release the delayed shipments.

Best regards,
Priya Sharma
Senior Billing Manager | Apex Logistics
Direct: +91 98201 55432`,
      attachments: [
        {
          fileName: "Apex_Updated_Invoice_4892.pdf",
          fileSize: "284 KB",
          fileType: "pdf",
          suspiciousCharacteristics: [
            "Embedded bank account changed from previous invoice on file",
          ],
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-3-1",
        category: "SENDER",
        title: "Lookalike Vendor Domain",
        explanation: "Legitimate company domain was 'apexlogistics.in'. Attacker registered 'apexlogistics-co.in' with an extra '-co'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-3-2",
        category: "PAYMENT_TRAP",
        title: "Unverified Bank Account Modification",
        explanation: "Modifying supplier banking details via unverified email is the textbook signature of Business Email Compromise (BEC).",
        severity: "CRITICAL",
      },
    ],
    correctAction: "ESCALATE_SOC",
    explanationOnSuccess: "Superb enterprise diligence! You recognized the lookalike domain 'apexlogistics-co.in' and escalated the banking change request.",
    explanationOnFailure: "Wiring corporate funds based purely on an email request causes millions in unrecoverable losses.",
    whatToDoInstead: "Any change in supplier bank details requires mandatory out-of-band phone verification using a previously vetted phone number.",
    isPublished: true,
    orderIndex: 3,
  },
  {
    id: "scen-inbox-it-zoom-client-patch",
    slug: "it-support-zoom-emergency-security-patch",
    title: "Global IT: Mandatory Zoom Security Patch (CVE-2026-9281)",
    channel: "INBOX",
    difficulty: "INTERMEDIATE",
    skillTag: "browsing_wifi",
    description: "An internal IT memo prompting users to run an executable installer to patch an urgent zero-day.",
    scenarioContent: {
      subject: "URGENT: Install Zoom Zero-Day Patch CVE-2026-9281 immediately",
      senderName: "Global IT Service Desk",
      senderAddress: "helpdesk@enterprise-servicedesk-support.com",
      senderDomain: "enterprise-servicedesk-support.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Team,

A critical zero-day vulnerability (CVE-2026-9281) has been discovered in Zoom desktop clients that allows remote code execution.

All employees must execute the attached self-extracting hotfix patch before 1:00 PM today. Systems that fail to apply the patch will be isolated from the internal network.

Instructions:
1. Download the attached 'Zoom_Security_Patch_x64.exe'
2. Double click to run as Administrator
3. Restart your laptop

IT Operations & Cyber Defense`,
      attachments: [
        {
          fileName: "Zoom_Security_Patch_x64.exe",
          fileSize: "1.4 MB",
          fileType: "exe",
          suspiciousCharacteristics: [
            "Executable file (.exe) sent directly via email attachment",
            "Unsigned binary payload",
          ],
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-4-1",
        category: "ATTACHMENT",
        title: "Malicious Executable Attachment",
        explanation: "Legitimate corporate IT pushes software silently via MDM/EDR; they never ask users to run raw .exe email attachments.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-4-2",
        category: "SENDER",
        title: "External Domain for Internal IT",
        explanation: "The email came from 'enterprise-servicedesk-support.com' instead of internal '@enterprise.org'.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Outstanding! You recognized that corporate IT never emails .exe files directly to employees for patching.",
    explanationOnFailure: "Running unknown .exe files from email attachments is the #1 vector for ransomware deployment.",
    whatToDoInstead: "Never run executable attachments. Enterprise software updates are deployed centrally through systems like Intune or Jamf.",
    isPublished: true,
    orderIndex: 4,
  },
  {
    id: "scen-inbox-legit-github-invite",
    slug: "legitimate-github-organization-invitation",
    title: "GitHub: Invitation to join the Enterprise-Core repository",
    channel: "INBOX",
    difficulty: "BEGINNER",
    skillTag: "phishing",
    description: "A legitimate collaboration invite from GitHub with verified SPF and DKIM signatures.",
    scenarioContent: {
      subject: "[GitHub] @techlead has invited you to join the enterprise-core team",
      senderName: "GitHub Notifications",
      senderAddress: "notifications@github.com",
      senderDomain: "github.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Hi Alex,

@techlead has invited you to join the enterprise-core organization on GitHub.

Repository: enterprise-core / security-audit-suite
Role: Contributor

This invitation will expire in 7 days.

View Invitation on GitHub: https://github.com/orgs/enterprise-core/invitation

If you were not expecting this invitation, you can ignore this email or report abuse to support@github.com.`,
      links: [
        {
          anchor: "https://github.com/orgs/enterprise-core/invitation",
          actualUrl: "https://github.com/orgs/enterprise-core/invitation",
          isMalicious: false,
        },
      ],
    },
    redFlags: [],
    correctAction: "IGNORE_SAFE",
    explanationOnSuccess: "Correct! This is a legitimate notification from verified github.com with authentic headers and official links.",
    explanationOnFailure: "You flagged a legitimate email as phishing. False positives can hinder company productivity when genuine notifications are blocked.",
    whatToDoInstead: "Verify the sender domain (@github.com) and verify that link destinations match the authentic platform before reporting.",
    isPublished: true,
    orderIndex: 5,
  },
  {
    id: "scen-inbox-income-tax-refund-india",
    slug: "incometax-gov-in-refund-crediting",
    title: "Income Tax Department: Tax Refund of ₹24,850 Approved",
    channel: "INBOX",
    difficulty: "INTERMEDIATE",
    skillTag: "payments",
    description: "A fraudulent notification targeting Indian taxpayers promising a direct tax refund into their bank account.",
    scenarioContent: {
      subject: "CONFIRMATION: Income Tax Refund of INR 24,850 credited to your account",
      senderName: "Income Tax Department of India",
      senderAddress: "refund-dept@incometaxindiaefiling-gov-in.com",
      senderDomain: "incometaxindiaefiling-gov-in.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Dear Taxpayer,

We have verified your Income Tax Return for Assessment Year 2026-27. A refund of ₹24,850 has been approved.

However, your bank account details on record could not be validated due to an IFSC code discrepancy.

To receive your refund within 24 hours, click the link below and authenticate with your Net Banking credentials or debit card details:
Submit Bank Details for Immediate Refund

Reference Number: ITD-REF-2026-88192

Directorate of Income Tax (Systems)
Government of India`,
      links: [
        {
          anchor: "Submit Bank Details for Immediate Refund",
          actualUrl: "https://incometax-gov-in.refund-processing-server.in/login",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-6-1",
        category: "SENDER",
        title: "Fake Government Domain",
        explanation: "All legitimate Indian government portals strictly end in '.gov.in', never '-gov-in.com'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-6-2",
        category: "URL",
        title: "Banking Credential Harvester",
        explanation: "The link points to 'refund-processing-server.in', which requests debit card details and NetBanking credentials.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Sharp eye! Indian government agencies never use '.com' domains. Official domains are strictly '.gov.in'.",
    explanationOnFailure: "The Income Tax Department never requests debit card numbers or Net Banking passwords via email links.",
    whatToDoInstead: "Check refund status only by logging into the official portal https://eportal.incometax.gov.in directly.",
    isPublished: true,
    orderIndex: 6,
  },
  {
    id: "scen-inbox-hr-annual-leave-audit",
    slug: "hr-annual-leave-encashment-excel-macro",
    title: "HR Portal: Annual Leave Encashment Calculation Sheet",
    channel: "INBOX",
    difficulty: "ADVANCED",
    skillTag: "data_privacy",
    description: "An email claiming to contain personal encashment calculations in an attached macro-enabled spreadsheet.",
    scenarioContent: {
      subject: "CONFIDENTIAL: Your Q4 Leave Encashment & Gratuity Calculation Sheet",
      senderName: "Human Resources - People Operations",
      senderAddress: "hr-payroll@enterprise-peopleops.org",
      senderDomain: "enterprise-peopleops.org",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Hi Alex,

Please find attached your verified leave balance and compensation encashment statement for the current financial year.

Please open the attached Excel spreadsheet, enable content/macros when prompted, and confirm your employee ID to view your calculated payout amount.

Statements must be confirmed by this Friday for inclusion in the upcoming payroll cycle.

People Operations & Payroll`,
      attachments: [
        {
          fileName: "Q4_Leave_Encashment_Statement.xlsm",
          fileSize: "189 KB",
          fileType: "xlsx",
          suspiciousCharacteristics: [
            "File extension .xlsm denotes macro-enabled workbook",
            "Prompts user to 'Enable Content/Macros' to execute VBA malware",
          ],
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-7-1",
        category: "ATTACHMENT",
        title: "Weaponized Macro-Enabled Excel File (.xlsm)",
        explanation: "Enabling macros in untrusted spreadsheets executes arbitrary malicious code on your workstation.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-7-2",
        category: "SENDER",
        title: "Lookalike Domain for HR",
        explanation: "The domain 'enterprise-peopleops.org' is an external domain not belonging to the company.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Outstanding! You spotted the dangerous .xlsm macro extension and external sender domain.",
    explanationOnFailure: "Enabling macros in an email attachment is how trojans like Emotet and ransomware infect corporate environments.",
    whatToDoInstead: "Never enable macros on attachments received via email. Check leave encashment inside your secure internal HRMS portal.",
    isPublished: true,
    orderIndex: 7,
  },
  {
    id: "scen-inbox-cloud-onedrive-file-share",
    slug: "onedrive-shared-financial-budget-phish",
    title: "OneDrive: CFO shared 'FY27_Corporate_Budget_Restructure.pdf' with you",
    channel: "INBOX",
    difficulty: "INTERMEDIATE",
    skillTag: "phishing",
    description: "A spoofed Microsoft SharePoint / OneDrive shared file notification directing to a phishing credential harvester.",
    scenarioContent: {
      subject: "Sarah Jenkins shared a file with you: FY27_Corporate_Budget_Restructure.pdf",
      senderName: "Microsoft SharePoint Notifications",
      senderAddress: "no-reply@sharepointonline-fileexchange.com",
      senderDomain: "sharepointonline-fileexchange.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Sarah Jenkins (CFO) has shared a restricted document with you.

File: FY27_Corporate_Budget_Restructure.pdf (3.4 MB)

This link will only work for alex.mercer@enterprise.org.
Open Document in SharePoint Online

Microsoft Security Shield Protected.`,
      links: [
        {
          anchor: "Open Document in SharePoint Online",
          actualUrl: "https://enterprise-my.sharepoint.com.storage-auth-redirect.cc/view/budget",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-8-1",
        category: "URL",
        title: "Phishing Domain Suffix (.cc)",
        explanation: "The destination URL terminates in '.storage-auth-redirect.cc', an external phishing server.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-8-2",
        category: "SENDER",
        title: "Spoofed SharePoint Domain",
        explanation: "Legitimate SharePoint sharing emails originate from sharepointonline.com, not 'sharepointonline-fileexchange.com'.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Excellent inspection! You looked past the SharePoint branding and caught the fake '.storage-auth-redirect.cc' link.",
    explanationOnFailure: "Attackers commonly use real employee names as lures to create high curiosity.",
    whatToDoInstead: "Always verify the final domain before entering credentials. Legitimate SharePoint links reside directly on *.sharepoint.com.",
    isPublished: true,
    orderIndex: 8,
  },
  {
    id: "scen-inbox-irctc-booking-tatkal",
    slug: "irctc-tatkal-ticket-cancellation-refund",
    title: "IRCTC e-Ticketing: PNR #2918291028 Cancellation & Refund Notice",
    channel: "INBOX",
    difficulty: "BEGINNER",
    skillTag: "payments",
    description: "An email mimicking Indian Railway Catering and Tourism Corporation regarding a ticket refund.",
    scenarioContent: {
      subject: "IRCTC Ticket Cancellation Refund Failed - PNR 2918291028",
      senderName: "IRCTC Customer Support",
      senderAddress: "refunds@irctc-eticketing-support.in",
      senderDomain: "irctc-eticketing-support.in",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Dear Passenger,

Your ticket booked under PNR 2918291028 (Train 12951 Mumbai Rajdhani) has been cancelled as per request.

The refund of ₹3,410 failed to credit to your account due to an invalid beneficiary mapping.

To claim your refund instantly into your UPI/Bank account, click below and verify your mobile number and UPI ID:
Claim IRCTC Refund Instantly

CRIS / IRCTC e-Ticketing Services`,
      links: [
        {
          anchor: "Claim IRCTC Refund Instantly",
          actualUrl: "https://irctc-refund-portal.in.net/claim-upi",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-9-1",
        category: "URL",
        title: "Third-party Fake Portal (.in.net)",
        explanation: "Legitimate IRCTC website is strictly 'irctc.co.in'. The link goes to 'irctc-refund-portal.in.net'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-9-2",
        category: "PAYMENT_TRAP",
        title: "Unsolicited UPI ID / PIN Demand",
        explanation: "IRCTC refunds automatically reverse to the source payment method without requiring manual UPI verification.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Well done! IRCTC automatically refunds back to the original source card/UPI without asking you to fill out web forms.",
    explanationOnFailure: "Falling for ticket refund scams gives attackers access to your UPI credentials and bank details.",
    whatToDoInstead: "Check your booking history exclusively on the official IRCTC app or irctc.co.in website.",
    isPublished: true,
    orderIndex: 9,
  },
  {
    id: "scen-inbox-aws-billing-spike-alarm",
    slug: "aws-cloudwatch-unexpected-usage-spike",
    title: "AWS CloudWatch: Billing Alarm Triggered - \$4,921.40 Over Limit",
    channel: "INBOX",
    difficulty: "ADVANCED",
    skillTag: "incident_response",
    description: "A high-fidelity cloud billing alert warning of unauthorized EC2 GPU instances spinning up.",
    scenarioContent: {
      subject: "ALARM: AWS Billing Threshold Exceeded - Account #4928-1920-8812",
      senderName: "Amazon Web Services",
      senderAddress: "no-reply-alerts@aws-cloudwatch-billing.com",
      senderDomain: "aws-cloudwatch-billing.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `You are receiving this email because your AWS CloudWatch billing alarm has triggered.

Account: 4928-1920-8812 (Enterprise Production)
Metric: EstimatedCharges
Threshold: \$500.00
Current Value: \$4,921.40
Region: us-east-1 (N. Virginia)

Unusual activity detected: 16x p4d.24xlarge EC2 instances provisioned in region ap-southeast-1.

If this activity was not authorized, terminate these instances and revoke compromised IAM credentials immediately:
Open AWS CloudWatch Billing Dashboard

Amazon Web Services, Inc.`,
      links: [
        {
          anchor: "Open AWS CloudWatch Billing Dashboard",
          actualUrl: "https://console.aws.amazon.com.iam-security-auth.co/signin",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-10-1",
        category: "URL",
        title: "Malicious AWS IAM Phishing Suffix",
        explanation: "URL ends in 'iam-security-auth.co' rather than authentic 'aws.amazon.com'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-10-2",
        category: "SENDER",
        title: "Forged AWS Alert Domain",
        explanation: "AWS notifications originate from @amazon.com or @amazonaws.com, never 'aws-cloudwatch-billing.com'.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Masterful detection! Attackers exploit the panic of thousands of dollars in surprise cloud charges to steal root credentials.",
    explanationOnFailure: "The panic of a \$4,900 cloud bill tricked you into clicking an attacker's fake AWS login page.",
    whatToDoInstead: "Never click links in billing alert emails. Always navigate independently to console.aws.amazon.com directly via bookmarks.",
    isPublished: true,
    orderIndex: 10,
  },
  // Adding Scenarios 11 - 20 (Inbox)
  {
    id: "scen-inbox-dhl-customs-duty",
    slug: "dhl-express-customs-clearance-payment",
    title: "DHL Express: International Parcel Held at Customs - Fee Required",
    channel: "INBOX",
    difficulty: "BEGINNER",
    skillTag: "payments",
    description: "An email claiming an urgent customs clearance charge of ₹1,450 is required to deliver an international shipment.",
    scenarioContent: {
      subject: "DHL Tracking #928192019: Duty & VAT Payment Required for Delivery",
      senderName: "DHL Express Clearance Desk",
      senderAddress: "clearance@dhl-tracking-express.com",
      senderDomain: "dhl-tracking-express.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Dear Customer,

Your parcel with tracking number #928192019 shipped from Frankfurt is currently held at airport customs.

Duty & Handling Fee: ₹1,450.00
Status: Clearance on Hold (Storage fees of ₹350/day will apply after 48 hours).

Pay Customs Duty Online to Release Parcel

DHL Express Global Forwarding`,
      links: [
        {
          anchor: "Pay Customs Duty Online to Release Parcel",
          actualUrl: "https://dhl-express-pay-duty.net/customs/pay",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-11-1",
        category: "URL",
        title: "Untrusted Domain (.net)",
        explanation: "Legitimate DHL tracking resides on 'dhl.com'. The link points to 'dhl-express-pay-duty.net'.",
        severity: "HIGH",
      },
      {
        id: "rf-inbox-11-2",
        category: "SENDER",
        title: "Unofficial DHL Sender Address",
        explanation: "Email is from 'dhl-tracking-express.com', not an authentic DHL domain.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Spot on! Package delivery scams are rampant because people frequently order online.",
    explanationOnFailure: "Paying unknown courier charges through email links exposes your credit card number to fraud.",
    whatToDoInstead: "If expecting a shipment, check the tracking number directly on the official DHL website (dhl.com).",
    isPublished: true,
    orderIndex: 11,
  },
  {
    id: "scen-inbox-slack-compliance-review",
    slug: "slack-workplace-chat-export-request",
    title: "Slack: Compliance Archive Export Ready for Download",
    channel: "INBOX",
    difficulty: "INTERMEDIATE",
    skillTag: "data_privacy",
    description: "A spoofed notification from Slack asking you to download an export of confidential internal channels.",
    scenarioContent: {
      subject: "Slack: Your Enterprise Grid chat history export is ready",
      senderName: "Slack Legal & Compliance",
      senderAddress: "compliance@slack-enterprise-cloud.net",
      senderDomain: "slack-enterprise-cloud.net",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Your requested workspace message archive has completed processing.

Archive contents: 48,290 messages across 14 private channels.
Size: 42.1 MB (.zip)

This download link will expire in 24 hours:
Download Slack Workspace Archive

Slack Technologies LLC`,
      links: [
        {
          anchor: "Download Slack Workspace Archive",
          actualUrl: "https://app.slack.com.chat-backup-sync.org/downloads/archive.zip",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-12-1",
        category: "URL",
        title: "Deceptive Domain Host (.org)",
        explanation: "Target host is 'chat-backup-sync.org', not slack.com.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-12-2",
        category: "REQUEST_TYPE",
        title: "Unsolicited Data Export",
        explanation: "You never requested a chat archive export.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Great vigilance! Unsolicited data export notifications often deliver malware or steal enterprise tokens.",
    explanationOnFailure: "Downloading unknown zip files from unsolicited emails will compromise your workstation.",
    whatToDoInstead: "Report to your Slack workspace administrator and never download unexpected archives.",
    isPublished: true,
    orderIndex: 12,
  },
  {
    id: "scen-inbox-legit-jira-assigned",
    slug: "legitimate-atlassian-jira-ticket-assignment",
    title: "Jira: [SEC-1042] Security assessment for Q1 payments microservice",
    channel: "INBOX",
    difficulty: "BEGINNER",
    skillTag: "phishing",
    description: "An authentic ticket assignment notification from Atlassian Jira Cloud.",
    scenarioContent: {
      subject: "[Jira] (SEC-1042) Security assessment for Q1 payments microservice",
      senderName: "Jira Cloud (enterprise.atlassian.net)",
      senderAddress: "jira@enterprise.atlassian.net",
      senderDomain: "atlassian.net",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Vikram Patel assigned a task to you.

Project: SEC / Cloud Security Engineering
Summary: Security assessment for Q1 payments microservice
Priority: High

View Issue: https://enterprise.atlassian.net/browse/SEC-1042

Comment:
"Hi Alex, please review the API specs and threat model before Wednesday's architecture review."

Atlassian Cloud Notifications`,
      links: [
        {
          anchor: "https://enterprise.atlassian.net/browse/SEC-1042",
          actualUrl: "https://enterprise.atlassian.net/browse/SEC-1042",
          isMalicious: false,
        },
      ],
    },
    redFlags: [],
    correctAction: "IGNORE_SAFE",
    explanationOnSuccess: "Accurate! This is a valid, legitimate Jira notification coming from your authenticated organization sub-domain.",
    explanationOnFailure: "You misidentified a routine legitimate work notification as malicious.",
    whatToDoInstead: "Notice the exact match between the anchor link, destination URL, and trusted company Atlassian domain.",
    isPublished: true,
    orderIndex: 13,
  },
  {
    id: "scen-inbox-linkedin-recruiter-malware",
    slug: "linkedin-recruiter-job-offer-malware-zip",
    title: "LinkedIn InMail: Lead Architect Role Offer + Technical Assessment",
    channel: "INBOX",
    difficulty: "ADVANCED",
    skillTag: "phishing",
    description: "An email appearing to be a LinkedIn InMail from a top tech company with a salary lure and a malicious zip attachment.",
    scenarioContent: {
      subject: "Exclusive Opportunity: Principal Cyber Security Architect (\$240k - \$310k + Equity)",
      senderName: "Elena Rostova (Executive Talent Partner)",
      senderAddress: "inmail-notifications@linkedin-recruitment-services.com",
      senderDomain: "linkedin-recruitment-services.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Hi Alex,

I came across your profile and was thoroughly impressed by your cybersecurity engineering contributions.

We are currently recruiting a Principal Architect for a tier-1 US cyber enterprise with remote flexibility in India. The compensation range is \$240k-\$310k USD.

I have attached the technical assessment requirements and scope document. Please review it and let me know if we can set up an introductory call with the VP of Engineering:

Attached: Candidate_Technical_Assessment_Scope.zip

Best regards,
Elena Rostova`,
      attachments: [
        {
          fileName: "Candidate_Technical_Assessment_Scope.zip",
          fileSize: "412 KB",
          fileType: "zip",
          suspiciousCharacteristics: [
            "Contains hidden shortcut (.lnk) file disguised as PDF",
            "PowerShell payload embedded inside archive",
          ],
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-14-1",
        category: "ATTACHMENT",
        title: "Malicious Zip File with Concealed LNK/Script",
        explanation: "Attackers commonly use job offers with high salaries to trick security engineers into executing LNK malware.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-14-2",
        category: "SENDER",
        title: "Unofficial LinkedIn Notification Domain",
        explanation: "Authentic LinkedIn InMail alerts strictly originate from @linkedin.com.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Incredible awareness! This is the infamous 'Lazarus / Job Lure' spear-phishing technique.",
    explanationOnFailure: "Unzipping unknown archives from unsolicited recruiters is a primary corporate breach vector.",
    whatToDoInstead: "Verify recruiters exclusively on the official linkedin.com platform, and never run attachments from email.",
    isPublished: true,
    orderIndex: 14,
  },
  {
    id: "scen-inbox-epfo-pf-claim-settlement",
    slug: "epfo-provident-fund-claim-approved-phish",
    title: "EPFO India: Your Provident Fund Claim ₹1,82,400 Has Been Settled",
    channel: "INBOX",
    difficulty: "INTERMEDIATE",
    skillTag: "payments",
    description: "An email mimicking the Employees' Provident Fund Organisation asking to verify UAN and Aadhaar.",
    scenarioContent: {
      subject: "EPFO: PF Claim Approved - Verify Bank Account for NEFT Disbursement",
      senderName: "Employees' Provident Fund Organisation",
      senderAddress: "helpdesk@epfindia-gov-online.com",
      senderDomain: "epfindia-gov-online.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Dear Member,

Your claim for partial withdrawal of Provident Fund accumulation (Amount: ₹1,82,400) under Claim ID PF-9281928 has been approved.

Due to recent RBI guidelines, members must re-authenticate their Universal Account Number (UAN) and Bank Account IFSC to complete the transfer:
Authenticate UAN & Bank Account

Note: Unauthenticated claims will be reversed to the central treasury within 72 hours.

Employees' Provident Fund Organisation
Ministry of Labour & Employment, Government of India`,
      links: [
        {
          anchor: "Authenticate UAN & Bank Account",
          actualUrl: "https://unifiedportal-mem.epfindia.gov.in.epf-portal-claim.in/login",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-15-1",
        category: "URL",
        title: "Punycode / Subdomain Deception",
        explanation: "The true domain is 'epf-portal-claim.in', not the official 'epfindia.gov.in'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-15-2",
        category: "SENDER",
        title: "Non-Governmental Domain",
        explanation: "Sender is 'epfindia-gov-online.com' rather than an authorized .gov.in domain.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Excellent! You spotted that the EPFO portal was being spoofed by an external '.in' domain.",
    explanationOnFailure: "Entering your UAN and bank details on fake portals allows attackers to divert your provident fund.",
    whatToDoInstead: "Log in only through the unified member portal at https://unifiedportal-mem.epfindia.gov.in directly.",
    isPublished: true,
    orderIndex: 15,
  },
  {
    id: "scen-inbox-google-security-critical-alert",
    slug: "google-workspace-new-device-signed-in",
    title: "Google: Critical Security Alert - New sign-in from Moscow, Russia",
    channel: "INBOX",
    difficulty: "INTERMEDIATE",
    skillTag: "credentials",
    description: "An email mimicking Google Accounts alerting you to an unauthorized login in Russia to trigger panic.",
    scenarioContent: {
      subject: "Critical security alert: New sign-in from Chrome on Windows (Moscow, Russia)",
      senderName: "Google Accounts Security",
      senderAddress: "no-reply@accounts-google-security-center.com",
      senderDomain: "accounts-google-security-center.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Your Google Account alex.mercer@enterprise.org was just signed in to from a new Windows device.

Location: Moscow, Russia
IP Address: 185.220.101.42
Time: Today at 3:14 AM GMT

If you didn't do this, someone else has your password. Please secure your account immediately:
Check Activity & Disconnect Hacker

Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043`,
      links: [
        {
          anchor: "Check Activity & Disconnect Hacker",
          actualUrl: "https://myaccount.google.com.session-recovery-hub.org/security",
          isMalicious: true,
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-16-1",
        category: "URL",
        title: "Deceptive Google Lookalike URL",
        explanation: "Link points to 'session-recovery-hub.org' designed to harvest your password and 2FA code.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-16-2",
        category: "SENDER",
        title: "External Domain for Google Notifications",
        explanation: "Google account alerts strictly come from @google.com or @accounts.google.com.",
        severity: "HIGH",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Sharp thinking! Attackers frequently use scary locations like 'Moscow, Russia' to panic users into logging in on phishing sites.",
    explanationOnFailure: "Panic is the attacker's best friend. You clicked the link without checking the destination URL.",
    whatToDoInstead: "If concerned about an alert, open a new browser tab and navigate to myaccount.google.com directly.",
    isPublished: true,
    orderIndex: 16,
  },
  {
    id: "scen-inbox-cfo-gift-cards-urgent",
    slug: "ceo-cfo-urgent-apple-google-gift-cards",
    title: "Urgent request from CEO: Client presentation gift cards",
    channel: "INBOX",
    difficulty: "BEGINNER",
    skillTag: "social_eng",
    description: "The classic executive gift card scam asking you to buy retail gift cards for a client meeting.",
    scenarioContent: {
      subject: "Quick favor: Are you at your desk right now?",
      senderName: "Sundar Rajan (Managing Director)",
      senderAddress: "sundar.rajan.corp.exec@gmail.com",
      senderDomain: "gmail.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Hi Alex,

I am tied up in an all-day client summit and cannot step out.

I need you to urgently purchase 5x Apple Gift Cards of ₹10,000 each for our keynote speakers. 

Scratch the back, take clear photos of the redemption codes, and email them back to me here. I will have finance reimburse you on priority by 5 PM today.

Please keep this confidential until the announcement.

Thanks,
Sundar Rajan
Managing Director`,
    },
    redFlags: [
      {
        id: "rf-inbox-17-1",
        category: "SENDER",
        title: "Personal Gmail Address for Corporate Executive",
        explanation: "The executive's official email is on @enterprise.org, not 'sundar.rajan.corp.exec@gmail.com'.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-17-2",
        category: "REQUEST_TYPE",
        title: "Gift Card Payment Request",
        explanation: "Gift cards are untraceable and cannot be reversed. Corporate executives will NEVER ask employees to buy gift cards.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Bravo! No legitimate business asks employees to buy retail gift cards using personal funds.",
    explanationOnFailure: "Gift card scams are irreversible. Once codes are sent to scammers, the money is gone forever.",
    whatToDoInstead: "Never buy gift cards on behalf of executives based on email requests. Report the email immediately.",
    isPublished: true,
    orderIndex: 17,
  },
  {
    id: "scen-inbox-vendor-nda-malicious-iso",
    slug: "vendor-nda-attachment-disk-image-iso",
    title: "Project Phoenix: Mutual Non-Disclosure Agreement (.ISO)",
    channel: "INBOX",
    difficulty: "EXPERT",
    skillTag: "phishing",
    description: "An advanced spear-phishing attack packaging malware inside a disk image (.iso) file to evade email gateway scanners.",
    scenarioContent: {
      subject: "Project Phoenix Mutual NDA - Executed Copy",
      senderName: "Marcus Vance (Vance Legal Partners)",
      senderAddress: "marcus@vance-legalpartners.com",
      senderDomain: "vance-legalpartners.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Alex,

Attached is the finalized mutual NDA for Project Phoenix signed by our managing partners.

Please review clause 7 regarding intellectual property and return a countersigned copy at your earliest convenience.

Kind regards,
Marcus Vance
Partner, Vance Legal Partners`,
      attachments: [
        {
          fileName: "Project_Phoenix_NDA_Signed.iso",
          fileSize: "2.1 MB",
          fileType: "iso",
          suspiciousCharacteristics: [
            "Disk image file format (.iso) used to bypass Mark-of-the-Web (MOTW) protections",
            "Mounting the image reveals a hidden script executing a remote Cobalt Strike beacon",
          ],
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-18-1",
        category: "ATTACHMENT",
        title: "Anomalous File Extension (.ISO)",
        explanation: "Legal contracts are distributed as PDF or Word documents, never as disk images (.iso / .img).",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-18-2",
        category: "AUTH_BYPASS",
        title: "Evasion Technique (Mark-of-the-Web Bypass)",
        explanation: "Attackers use .ISO containers so Windows does not attach security warning flags to files inside the container.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Incredible cybersecurity expertise! Spotting container formats like .iso or .vhd for office documents is a signature of elite threat defense.",
    explanationOnFailure: "Opening the .iso mounts a virtual drive that runs malicious scripts on your system without OS security warnings.",
    whatToDoInstead: "Block and report any document claiming to be a contract that arrives with disk image (.iso, .img, .vhd) extensions.",
    isPublished: true,
    orderIndex: 18,
  },
  {
    id: "scen-inbox-corporate-travel-itinerary",
    slug: "corporate-travel-desk-flight-ticket-pdf",
    title: "Corporate Travel: Confirmed Flight Itinerary (DEL -> BLR)",
    channel: "INBOX",
    difficulty: "BEGINNER",
    skillTag: "phishing",
    description: "A legitimate corporate travel desk confirmation for an upcoming business trip.",
    scenarioContent: {
      subject: "E-Ticket: Booking Reference 6E-8921 (DEL to BLR) - Alex Mercer",
      senderName: "Enterprise Travel Desk",
      senderAddress: "traveldesk@enterprise.org",
      senderDomain: "enterprise.org",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `Dear Alex,

Your flight booking for your quarterly planning trip to Bengaluru has been confirmed by corporate travel desk.

Flight: IndiGo 6E-8921
Departure: Indira Gandhi International Airport (DEL), Terminal 1 - 08:30 AM
Arrival: Kempegowda International Airport (BLR), Terminal 1 - 11:15 AM
Seat: 12F

Attached: Official E-Ticket & Corporate Travel Insurance Receipt (.pdf).

Corporate Travel Operations`,
      attachments: [
        {
          fileName: "IndiGo_ETicket_6E8921.pdf",
          fileSize: "184 KB",
          fileType: "pdf",
          suspiciousCharacteristics: [],
        },
      ],
    },
    redFlags: [],
    correctAction: "IGNORE_SAFE",
    explanationOnSuccess: "Correct! This is a legitimate internal email from the verified company travel desk with clean attachments.",
    explanationOnFailure: "Reporting benign operational emails creates unnecessary false alarms for security analysts.",
    whatToDoInstead: "Inspect internal sender headers, verified domain origins, and expected business context.",
    isPublished: true,
    orderIndex: 19,
  },
  {
    id: "scen-inbox-crowdstrike-update-fake",
    slug: "crowdstrike-falcon-emergency-crash-remediation",
    title: "CrowdStrike: Urgent Falcon Sensor Driver Remediation Script",
    channel: "INBOX",
    difficulty: "EXPERT",
    skillTag: "incident_response",
    description: "Exploiting global IT outages by distributing a malicious 'remediation script' pretending to be CrowdStrike.",
    scenarioContent: {
      subject: "HOTFIX: CrowdStrike Falcon Sensor Crash Remediation (Channel File 291)",
      senderName: "CrowdStrike Threat Intelligence",
      senderAddress: "remediation@crowdstrike-response-cloud.com",
      senderDomain: "crowdstrike-response-cloud.com",
      recipientName: "Alex Mercer",
      recipientAddress: "alex.mercer@enterprise.org",
      body: `System Administrators & End Users,

CrowdStrike has identified a critical bug in Falcon sensor channel file 291 causing blue screen loops.

To restore system stability immediately, execute the attached PowerShell remediation script with administrative privileges:
Attached: Fix_Falcon_Sensor_Crash.ps1

CrowdStrike Global Response Team`,
      attachments: [
        {
          fileName: "Fix_Falcon_Sensor_Crash.ps1",
          fileSize: "18 KB",
          fileType: "exe", // executable script
          suspiciousCharacteristics: [
            "PowerShell script (.ps1) received via unsolicited external email",
            "Establishes reverse shell to command-and-control server",
          ],
        },
      ],
    },
    redFlags: [
      {
        id: "rf-inbox-20-1",
        category: "SENDER",
        title: "Opportunistic Lookalike Domain",
        explanation: "Domain 'crowdstrike-response-cloud.com' registered by threat actors capitalizing on breaking news.",
        severity: "CRITICAL",
      },
      {
        id: "rf-inbox-20-2",
        category: "ATTACHMENT",
        title: "Malicious PowerShell Script (.ps1)",
        explanation: "Executing PowerShell scripts from external emails executes malware directly in memory.",
        severity: "CRITICAL",
      },
    ],
    correctAction: "REPORT_PHISH",
    explanationOnSuccess: "Outstanding situational awareness! Threat actors routinely weaponize global breaking news to trick anxious users.",
    explanationOnFailure: "Running PowerShell scripts from email is catastrophic. It completely hands over administrative control of your PC to attackers.",
    whatToDoInstead: "Security vendors publish remediation instructions through their official customer portals, never via unsolicited raw scripts.",
    isPublished: true,
    orderIndex: 20,
  },
];
