import { isNonEmptyString } from '@sniptt/guards';
import {
  type EmailAssistantLanguage,
  type EmailAssistantLength,
  type EmailAssistantTone,
} from 'twenty-shared/ai';

export type EmailAssistantPreferences = {
  instructions: string | null;
  tone: EmailAssistantTone;
  language: EmailAssistantLanguage;
  length: EmailAssistantLength;
};

const TONE_GUIDELINE: Record<EmailAssistantTone, string> = {
  professional: 'Polite and businesslike. No filler, no exclamation marks.',
  friendly: 'Warm and conversational while staying professional.',
  direct:
    'Short sentences, straight to the point, no pleasantries beyond the greeting.',
  warm: 'Personal and appreciative, acknowledging what the other person said.',
};

const LENGTH_GUIDELINE: Record<EmailAssistantLength, string> = {
  concise: 'Keep it under 120 words.',
  balanced: 'Keep it under 200 words.',
  detailed: 'Answer every open point, up to 350 words.',
};

const LANGUAGE_GUIDELINE: Record<EmailAssistantLanguage, string> = {
  auto: 'Write in the language of the most recent received message.',
  en: 'Write in English.',
  fr: 'Write in French.',
  es: 'Write in Spanish.',
  de: 'Write in German.',
  it: 'Write in Italian.',
  pt: 'Write in Portuguese.',
  nl: 'Write in Dutch.',
};

export const buildEmailAssistantGuidelines = ({
  instructions,
  tone,
  language,
  length,
}: EmailAssistantPreferences): string => {
  const sections = [
    [
      '# Style',
      `- Tone: ${TONE_GUIDELINE[tone]}`,
      `- Length: ${LENGTH_GUIDELINE[length]}`,
      `- Language: ${LANGUAGE_GUIDELINE[language]}`,
    ].join('\n'),
  ];

  const trimmedInstructions = instructions?.trim();

  if (isNonEmptyString(trimmedInstructions)) {
    sections.push(
      [
        '# Workspace context',
        'The workspace administrator wrote the following. Treat it as instructions from the user.',
        '',
        trimmedInstructions,
      ].join('\n'),
    );
  }

  return sections.join('\n\n');
};
