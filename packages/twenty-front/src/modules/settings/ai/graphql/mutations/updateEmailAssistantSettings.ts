import gql from 'graphql-tag';

export const UPDATE_EMAIL_ASSISTANT_SETTINGS = gql`
  mutation UpdateEmailAssistantSettings($input: UpdateWorkspaceInput!) {
    updateWorkspace(input: $input) {
      id
      aiEmailInstructions
      aiEmailTone
      aiEmailLanguage
      aiEmailLength
      isAiEmailAutoSummaryEnabled
    }
  }
`;
