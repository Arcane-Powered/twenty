import { registerEnumType } from '@nestjs/graphql';

import { type EmailAssistantTone as SharedEmailAssistantTone } from 'twenty-shared/ai';

// GraphQL needs a runtime enum. Keys equal values so the GraphQL names are the
// twenty-shared literals and the client can use one type on both sides.
export enum EmailAssistantTone {
  professional = 'professional',
  friendly = 'friendly',
  direct = 'direct',
  warm = 'warm',
}

registerEnumType(EmailAssistantTone, { name: 'EmailAssistantTone' });

const _assertToneValuesMatchShared: Record<
  SharedEmailAssistantTone,
  EmailAssistantTone
> = EmailAssistantTone;
