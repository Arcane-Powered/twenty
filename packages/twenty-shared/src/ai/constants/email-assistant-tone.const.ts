export const EMAIL_ASSISTANT_TONES = [
  'professional',
  'friendly',
  'direct',
  'warm',
] as const;

export type EmailAssistantTone = (typeof EMAIL_ASSISTANT_TONES)[number];
