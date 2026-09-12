import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  type EmailAssistantTone as SharedEmailAssistantTone,
  type EmailDraftMode as SharedEmailDraftMode,
} from 'twenty-shared/ai';

import {
  MAX_EMAIL_ASSISTANT_MESSAGE_LENGTH,
  MAX_EMAIL_ASSISTANT_THREAD_MESSAGES,
} from 'src/engine/metadata-modules/ai/ai-email-assistant/constants/ai-email-assistant.const';
import { EmailThreadMessageInput } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/email-thread-message.input';
import { EmailAssistantTone } from 'src/engine/metadata-modules/ai/ai-email-assistant/types/email-assistant-tone.enum';
import { EmailDraftMode } from 'src/engine/metadata-modules/ai/ai-email-assistant/types/email-draft-mode.enum';

@InputType()
export class GenerateEmailDraftInput {
  @Field(() => EmailDraftMode)
  @IsEnum(EmailDraftMode)
  mode: SharedEmailDraftMode;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  messageThreadId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  subject?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_EMAIL_ASSISTANT_MESSAGE_LENGTH)
  currentBody?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  instruction?: string;

  @Field(() => EmailAssistantTone, { nullable: true })
  @IsEnum(EmailAssistantTone)
  @IsOptional()
  tone?: SharedEmailAssistantTone;

  @Field(() => [EmailThreadMessageInput], { nullable: true })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(MAX_EMAIL_ASSISTANT_THREAD_MESSAGES)
  @ValidateNested({ each: true })
  @Type(() => EmailThreadMessageInput)
  messages?: EmailThreadMessageInput[];
}
