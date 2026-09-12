export const EMAIL_ASSISTANT_LENGTHS = [
  'concise',
  'balanced',
  'detailed',
] as const;

export type EmailAssistantLength = (typeof EMAIL_ASSISTANT_LENGTHS)[number];
