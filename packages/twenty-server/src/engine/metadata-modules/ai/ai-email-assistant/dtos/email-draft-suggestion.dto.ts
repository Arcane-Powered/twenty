import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('EmailDraftSuggestion')
export class EmailDraftSuggestionDTO {
  // Empty in review mode, where the assistant only comments on the draft.
  @Field(() => String)
  body: string;

  @Field(() => [String])
  comments: string[];

  @Field(() => String)
  modelId: string;
}
