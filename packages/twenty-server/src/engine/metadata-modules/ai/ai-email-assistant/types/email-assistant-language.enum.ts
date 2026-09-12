import { registerEnumType } from '@nestjs/graphql';

import { type EmailAssistantLanguage as SharedEmailAssistantLanguage } from 'twenty-shared/ai';

export enum EmailAssistantLanguage {
  auto = 'auto',
  en = 'en',
  fr = 'fr',
  es = 'es',
  de = 'de',
  it = 'it',
  pt = 'pt',
  nl = 'nl',
}

registerEnumType(EmailAssistantLanguage, { name: 'EmailAssistantLanguage' });

const _assertLanguageValuesMatchShared: Record<
  SharedEmailAssistantLanguage,
  EmailAssistantLanguage
> = EmailAssistantLanguage;
