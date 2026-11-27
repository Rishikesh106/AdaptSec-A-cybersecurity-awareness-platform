import { Scenario } from "@/lib/types";
import { INBOX_SCENARIOS } from "./scenarios/inboxScenarios";
import { SMS_WHATSAPP_SCENARIOS } from "./scenarios/smsWhatsappScenarios";
import { UPI_SCENARIOS } from "./scenarios/upiScenarios";
import { VOICE_LOGIN_SCENARIOS } from "./scenarios/voiceLoginScenarios";

export const ALL_SEED_SCENARIOS: Scenario[] = [
  ...INBOX_SCENARIOS,
  ...SMS_WHATSAPP_SCENARIOS,
  ...UPI_SCENARIOS,
  ...VOICE_LOGIN_SCENARIOS,
];

export function getScenariosByChannel(channel: string): Scenario[] {
  return ALL_SEED_SCENARIOS.filter((s) => s.channel === channel);
}

export function getScenariosBySkill(skillTag: string): Scenario[] {
  return ALL_SEED_SCENARIOS.filter((s) => s.skillTag === skillTag);
}

export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SEED_SCENARIOS.find((s) => s.id === id || s.slug === id);
}
