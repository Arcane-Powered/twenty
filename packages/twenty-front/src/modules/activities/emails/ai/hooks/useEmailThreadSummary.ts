import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type EmailThreadSummary } from '@/activities/emails/ai/types/EmailThreadSummary';
import { buildEmailAssistantMessageInputs } from '@/activities/emails/ai/utils/buildEmailAssistantMessageInputs';
import { SUMMARIZE_EMAIL_THREAD } from '@/activities/emails/graphql/mutations/summarizeEmailThread';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

type UseEmailThreadSummaryArgs = {
  messageThreadId: string;
  subject?: string;
  messages: EmailThreadMessageWithSender[];
};

export const useEmailThreadSummary = ({
  messageThreadId,
  subject,
  messages,
}: UseEmailThreadSummaryArgs) => {
  const [summary, setSummary] = useState<EmailThreadSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [summarizeEmailThread, { loading }] = useMutation<{
    summarizeEmailThread: EmailThreadSummary;
  }>(SUMMARIZE_EMAIL_THREAD);

  const generateSummary = useCallback(async () => {
    const messageInputs = buildEmailAssistantMessageInputs(messages);

    if (messageInputs.length === 0) {
      setErrorMessage(t`This thread has no readable message yet.`);

      return;
    }

    setErrorMessage(null);

    try {
      const result = await summarizeEmailThread({
        variables: {
          input: { messageThreadId, subject, messages: messageInputs },
        },
      });

      const generatedSummary = result.data?.summarizeEmailThread;

      if (isDefined(generatedSummary)) {
        setSummary(generatedSummary);
      }
    } catch {
      setErrorMessage(t`The summary could not be generated.`);
    }
  }, [messages, messageThreadId, subject, summarizeEmailThread]);

  return { summary, errorMessage, loading, generateSummary };
};
