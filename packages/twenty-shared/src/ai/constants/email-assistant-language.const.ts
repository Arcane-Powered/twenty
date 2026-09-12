// 'auto' answers in the language of the thread, which is what most users want
// when they write to counterparts in several countries.
export const EMAIL_ASSISTANT_LANGUAGES = [
  'auto',
  'en',
  'fr',
  'es',
  'de',
  'it',
  'pt',
  'nl',
] as const;

export type EmailAssistantLanguage =
  (typeof EMAIL_ASSISTANT_LANGUAGES)[number];
