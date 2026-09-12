import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { type EmailAssistantTone, type EmailDraftMode } from 'twenty-shared/ai';
import { isDefined, tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { type EmailDraftSuggestion } from '@/activities/emails/ai/types/EmailDraftSuggestion';
import { buildEmailAssistantMessageInputs } from '@/activities/emails/ai/utils/buildEmailAssistantMessageInputs';
import { GENERATE_EMAIL_DRAFT } from '@/activities/emails/graphql/mutations/generateEmailDraft';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

type UseEmailDraftAssistantArgs = {
  messageThreadId?: string;
  subject?: string;
  messages?: EmailThreadMessageWithSender[];
  getSerializedBody: () => string;
};

type RequestSuggestionArgs = {
  mode: EmailDraftMode;
  instruction?: string;
  tone?: EmailAssistantTone;
};

export const useEmailDraftAssistant = ({
  messageThreadId,
  subject,
  messages,
  getSerializedBody,
}: UseEmailDraftAssistantArgs) => {
  const [suggestion, setSuggestion] = useState<EmailDraftSuggestion | null>(
    null,
  );
  const [lastRequest, setLastRequest] = useState<RequestSuggestionArgs | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [generateEmailDraft, { loading }] = useMutation<{
    generateEmailDraft: EmailDraftSuggestion;
  }>(GENERATE_EMAIL_DRAFT);

  const requestSuggestion = useCallback(
    async ({ mode, instruction, tone }: RequestSuggestionArgs) => {
      const currentBody = tipTapDocumentToMarkdown(getSerializedBody());
      const messageInputs = isDefined(messages)
        ? buildEmailAssistantMessageInputs(messages)
        : [];

      setErrorMessage(null);
      setLastRequest({ mode, instruction, tone });

      try {
        const result = await generateEmailDraft({
          variables: {
            input: {
              mode,
              messageThreadId,
              subject,
              currentBody: currentBody.length > 0 ? currentBody : undefined,
              instruction,
              tone,
              messages: messageInputs.length > 0 ? messageInputs : undefined,
            },
          },
        });

        const generatedSuggestion = result.data?.generateEmailDraft;

        if (isDefined(generatedSuggestion)) {
          setSuggestion(generatedSuggestion);
        }
      } catch {
        setErrorMessage(t`The assistant could not answer.`);
      }
    },
    [generateEmailDraft, getSerializedBody, messageThreadId, messages, subject],
  );

  const regenerate = useCallback(async () => {
    if (isDefined(lastRequest)) {
      await requestSuggestion(lastRequest);
    }
  }, [lastRequest, requestSuggestion]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null);
    setErrorMessage(null);
  }, []);

  return {
    suggestion,
    errorMessage,
    loading,
    requestSuggestion,
    regenerate,
    dismissSuggestion,
  };
};
