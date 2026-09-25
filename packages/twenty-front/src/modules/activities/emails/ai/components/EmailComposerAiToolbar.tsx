import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { type EmailAssistantTone } from 'twenty-shared/ai';
import { isDefined, tipTapDocumentToMarkdown } from 'twenty-shared/utils';
import { IconCheck, IconEye, IconSparkles, IconTextSize } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { EmailComposerAiSuggestion } from '@/activities/emails/ai/components/EmailComposerAiSuggestion';
import { useEmailDraftAssistant } from '@/activities/emails/ai/hooks/useEmailDraftAssistant';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { Select } from '@/ui/input/components/Select';

const StyledContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInstructionRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledInstructionInput = styled.input`
  all: unset;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
`;

type EmailComposerAiToolbarProps = {
  composerState: EmailComposerState;
  messageThreadId?: string;
  threadMessages?: EmailThreadMessageWithSender[];
};

export const EmailComposerAiToolbar = ({
  composerState,
  messageThreadId,
  threadMessages,
}: EmailComposerAiToolbarProps) => {
  const [instruction, setInstruction] = useState('');

  const getSerializedBody = useCallback(
    () => composerState.body,
    [composerState.body],
  );

  const {
    suggestion,
    errorMessage,
    loading,
    requestSuggestion,
    regenerate,
    dismissSuggestion,
  } = useEmailDraftAssistant({
    messageThreadId,
    subject: composerState.subject,
    messages: threadMessages,
    getSerializedBody,
  });

  const currentBodyText = tipTapDocumentToMarkdown(composerState.body).trim();
  const hasBody = currentBodyText.length > 0;
  const canReply = isDefined(threadMessages) && threadMessages.length > 0;

  const handleReplaceBody = (body: string) => {
    composerState.replaceBody(
      serializePlainTextAsAdvancedTextEditorDocument(body),
    );
    dismissSuggestion();
  };

  const handleAppendBody = (body: string) => {
    const nextBody = hasBody ? `${currentBodyText}\n\n${body}` : body;

    composerState.replaceBody(
      serializePlainTextAsAdvancedTextEditorDocument(nextBody),
    );
    dismissSuggestion();
  };

  const handleInstructionSubmit = () => {
    if (instruction.trim().length === 0 || loading) {
      return;
    }

    void requestSuggestion({ mode: 'custom', instruction });
    setInstruction('');
  };

  return (
    <StyledContainer>
      <StyledActions>
        {canReply && (
          <Button
            startIcon={<IconSparkles />}
            size="sm"
            disabled={loading}
            onClick={() => requestSuggestion({ mode: 'reply' })}
            variant="solid"
            color="accent"
          >
            {t`Draft a reply`}
          </Button>
        )}
        <Button
          startIcon={<IconCheck />}
          size="sm"
          disabled={loading || !hasBody}
          onClick={() => requestSuggestion({ mode: 'fixGrammar' })}
        >
          {t`Fix grammar`}
        </Button>
        <Button
          startIcon={<IconEye />}
          size="sm"
          disabled={loading || !hasBody}
          onClick={() => requestSuggestion({ mode: 'review' })}
        >
          {t`Review`}
        </Button>
        <Button
          startIcon={<IconTextSize />}
          size="sm"
          disabled={loading || !hasBody}
          onClick={() => requestSuggestion({ mode: 'shorten' })}
        >
          {t`Shorten`}
        </Button>
        <Select<EmailAssistantTone | 'default'>
          dropdownId="email-composer-ai-tone"
          selectSizeVariant="small"
          disabled={loading || !hasBody}
          value="default"
          options={[
            { value: 'default', label: t`Change tone` },
            { value: 'professional', label: t`Professional` },
            { value: 'friendly', label: t`Friendly` },
            { value: 'direct', label: t`Direct` },
            { value: 'warm', label: t`Warm` },
          ]}
          onChange={(tone) => {
            if (tone !== 'default') {
              void requestSuggestion({ mode: 'changeTone', tone });
            }
          }}
        />
      </StyledActions>
      <StyledInstructionRow>
        <IconSparkles size={16} />
        <StyledInstructionInput
          value={instruction}
          placeholder={t`Ask the assistant to write or change something…`}
          onChange={(event) => setInstruction(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleInstructionSubmit();
            }
          }}
        />
      </StyledInstructionRow>
      {loading && <ShimmeringText>{t`Writing…`}</ShimmeringText>}
      {!loading && isDefined(errorMessage) && (
        <StyledError>{errorMessage}</StyledError>
      )}
      {!loading && isDefined(suggestion) && (
        <EmailComposerAiSuggestion
          suggestion={suggestion}
          isLoading={loading}
          onReplaceBody={handleReplaceBody}
          onAppendBody={handleAppendBody}
          onRegenerate={regenerate}
          onDismiss={dismissSuggestion}
        />
      )}
    </StyledContainer>
  );
};
