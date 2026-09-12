import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

import { MAX_EMAIL_ASSISTANT_MESSAGE_LENGTH } from 'src/engine/metadata-modules/ai/ai-email-assistant/constants/ai-email-assistant.const';

@InputType()
export class EmailThreadMessageInput {
  @Field(() => String)
  @IsString()
  @MaxLength(200)
  senderDisplayName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(320)
  senderHandle?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  receivers?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  sentAt?: string;

  @Field(() => String)
  @IsString()
  @MaxLength(MAX_EMAIL_ASSISTANT_MESSAGE_LENGTH)
  text: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFromWorkspaceMember?: boolean;
}
