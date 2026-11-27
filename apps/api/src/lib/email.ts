import nodemailer from "nodemailer";
import { loadEnv } from "../config/env.js";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailAdapter {
  send(msg: EmailMessage): Promise<void>;
}

class SmtpEmailAdapter implements EmailAdapter {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor() {
    const env = loadEnv();
    this.from = env.SMTP_FROM;
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
  }

  async send(msg: EmailMessage): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
    } catch {
      // In dev without Mailpit running, do not crash auth flows
    }
  }
}

export const emailAdapter: EmailAdapter = new SmtpEmailAdapter();
