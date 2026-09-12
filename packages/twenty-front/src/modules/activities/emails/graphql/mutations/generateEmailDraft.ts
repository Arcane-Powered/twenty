import gql from 'graphql-tag';

export const GENERATE_EMAIL_DRAFT = gql`
  mutation GenerateEmailDraft($input: GenerateEmailDraftInput!) {
    generateEmailDraft(input: $input) {
      body
      comments
      modelId
    }
  }
`;
