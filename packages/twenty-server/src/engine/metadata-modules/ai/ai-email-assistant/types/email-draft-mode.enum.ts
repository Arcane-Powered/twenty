import { registerEnumType } from '@nestjs/graphql';

import { type EmailDraftMode as SharedEmailDraftMode } from 'twenty-shared/ai';

export enum EmailDraftMode {
  reply = 'reply',
  fixGrammar = 'fixGrammar',
  review = 'review',
  shorten = 'shorten',
  expand = 'expand',
  changeTone = 'changeTone',
  custom = 'custom',
}

registerEnumType(EmailDraftMode, { name: 'EmailDraftMode' });

const _assertDraftModeValuesMatchShared: Record<
  SharedEmailDraftMode,
  EmailDraftMode
> = EmailDraftMode;
