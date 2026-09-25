import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh, IconSparkles, IconX } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { EmailThreadAiSummaryContent } from '@/activities/emails/ai/components/EmailThreadAiSummaryContent';
import { useEmailThreadSummary } from '@/activities/emails/ai/hooks/useEmailThreadSummary';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

const StyledPlaceholder = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
`;

const StyledEmptyState = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

type EmailThreadAiPanelProps = {
  messageThreadId: string;
  subject?: string;
  messages: EmailThreadMessageWithSender[];
  shouldGenerateOnOpen: boolean;
  onClose: () => void;
};

export const EmailThreadAiPanel = ({
  messageThreadId,
  subject,
  messages,
  shouldGenerateOnOpen,
  onClose,
}: EmailThreadAiPanelProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { summary, errorMessage, loading, generateSummary } =
    useEmailThreadSummary({ messageThreadId, subject, messages });

  const [hasRequestedOnOpen, setHasRequestedOnOpen] = useState(false);

  useEffect(() => {
    if (!shouldGenerateOnOpen || hasRequestedOnOpen) {
      return;
    }

    setHasRequestedOnOpen(true);
    void generateSummary();
  }, [shouldGenerateOnOpen, hasRequestedOnOpen, generateSummary]);

  const hasSummary = isDefined(summary);

  return (
    <StyledPanel>
      <StyledHeader>
        <IconSparkles size={16} />
        <StyledTitle>{t`Assistant`}</StyledTitle>
        {hasSummary && (
          <LightIconButton
            emphasis="subtle"
            disabled={loading}
            onClick={generateSummary}
            aria-label={t`Regenerate the summary`}
          >
            <IconRefresh />
          </LightIconButton>
        )}
        <LightIconButton
          emphasis="subtle"
          onClick={onClose}
          aria-label={t`Close the assistant`}
        >
          <IconX />
        </LightIconButton>
      </StyledHeader>
      <StyledBody>
        {loading && <ShimmeringText>{t`Reading the thread…`}</ShimmeringText>}
        {!loading && isDefined(errorMessage) && (
          <StyledEmptyState>
            <StyledPlaceholder>{errorMessage}</StyledPlaceholder>
            <Button
              startIcon={<IconRefresh />}
              size="sm"
              onClick={generateSummary}
            >
              {t`Try again`}
            </Button>
          </StyledEmptyState>
        )}
        {!loading && !isDefined(errorMessage) && !hasSummary && (
          <StyledEmptyState>
            <StyledPlaceholder>
              {t`Get the thread in a few lines, with what is expected from you.`}
            </StyledPlaceholder>
            <Button
              startIcon={<IconSparkles />}
              size="sm"
              onClick={generateSummary}
              variant="solid"
              color="accent"
            >
              {t`Summarize this thread`}
            </Button>
          </StyledEmptyState>
        )}
        {!loading && hasSummary && (
          <EmailThreadAiSummaryContent summary={summary} />
        )}
      </StyledBody>
      {hasSummary && (
        <StyledFooter>
          <span>
            {t`Generated ${beautifyPastDateRelativeToNow(
              summary.generatedAt,
              localeCatalog,
            )}`}
          </span>
          <span>{summary.modelId}</span>
        </StyledFooter>
      )}
    </StyledPanel>
  );
};
