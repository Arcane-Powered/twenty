import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { MAX_EMAIL_ASSISTANT_THREAD_MESSAGES } from 'src/engine/metadata-modules/ai/ai-email-assistant/constants/ai-email-assistant.const';
import { EmailThreadMessageInput } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/email-thread-message.input';

@InputType()
export class SummarizeEmailThreadInput {
  @Field(() => String)
  @IsUUID()
  messageThreadId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  subject?: string;

  @Field(() => [EmailThreadMessageInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_EMAIL_ASSISTANT_THREAD_MESSAGES)
  @ValidateNested({ each: true })
  @Type(() => EmailThreadMessageInput)
  messages: EmailThreadMessageInput[];
}
