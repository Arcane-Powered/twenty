import { registerEnumType } from '@nestjs/graphql';

import { type EmailAssistantLength as SharedEmailAssistantLength } from 'twenty-shared/ai';

export enum EmailAssistantLength {
  concise = 'concise',
  balanced = 'balanced',
  detailed = 'detailed',
}

registerEnumType(EmailAssistantLength, { name: 'EmailAssistantLength' });

const _assertLengthValuesMatchShared: Record<
  SharedEmailAssistantLength,
  EmailAssistantLength
> = EmailAssistantLength;
