import gql from 'graphql-tag';

export const SUMMARIZE_EMAIL_THREAD = gql`
  mutation SummarizeEmailThread($input: SummarizeEmailThreadInput!) {
    summarizeEmailThread(input: $input) {
      summary
      keyPoints
      nextActions
      awaitsReply
      generatedAt
      modelId
    }
  }
`;
