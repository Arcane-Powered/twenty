export const EMAIL_DRAFT_MODES = [
  'reply',
  'fixGrammar',
  'review',
  'shorten',
  'expand',
  'changeTone',
  'custom',
] as const;

export type EmailDraftMode = (typeof EMAIL_DRAFT_MODES)[number];
