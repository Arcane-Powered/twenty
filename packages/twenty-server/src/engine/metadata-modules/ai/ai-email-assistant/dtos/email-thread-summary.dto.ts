import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('EmailThreadSummary')
export class EmailThreadSummaryDTO {
  @Field(() => String)
  summary: string;

  @Field(() => [String])
  keyPoints: string[];

  @Field(() => [String])
  nextActions: string[];

  @Field(() => Boolean)
  awaitsReply: boolean;

  @Field(() => String)
  generatedAt: string;

  @Field(() => String)
  modelId: string;
}
