import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconRefresh, IconSparkles, IconX } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type EmailDraftSuggestion } from '@/activities/emails/ai/types/EmailDraftSuggestion';

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.blue};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.accent.accent11};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeaderTitle = styled.span`
  flex: 1;
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledBody = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  max-height: 220px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const StyledCommentList = styled.ul`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.45;
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type EmailComposerAiSuggestionProps = {
  suggestion: EmailDraftSuggestion;
  isLoading: boolean;
  onReplaceBody: (body: string) => void;
  onAppendBody: (body: string) => void;
  onRegenerate: () => void;
  onDismiss: () => void;
};

export const EmailComposerAiSuggestion = ({
  suggestion,
  isLoading,
  onReplaceBody,
  onAppendBody,
  onRegenerate,
  onDismiss,
}: EmailComposerAiSuggestionProps) => {
  const isReview = suggestion.body.length === 0;

  return (
    <StyledCard>
      <StyledHeader>
        <IconSparkles size={14} />
        <StyledHeaderTitle>
          {isReview ? t`Review` : t`Assistant suggestion`}
        </StyledHeaderTitle>
        <StyledHint>{t`Nothing is sent`}</StyledHint>
        <LightIconButton
          Icon={IconX}
          accent="tertiary"
          onClick={onDismiss}
          aria-label={t`Dismiss the suggestion`}
        />
      </StyledHeader>
      {isReview ? (
        suggestion.comments.length > 0 ? (
          <StyledCommentList>
            {suggestion.comments.map((comment) => (
              <li key={comment}>{comment}</li>
            ))}
          </StyledCommentList>
        ) : (
          <StyledBody>{t`Nothing to change, this draft is ready to send.`}</StyledBody>
        )
      ) : (
        <>
          <StyledBody>{suggestion.body}</StyledBody>
          <StyledActions>
            <Button
              title={t`Replace`}
              size="small"
              accent="blue"
              disabled={isLoading}
              onClick={() => onReplaceBody(suggestion.body)}
            />
            <Button
              title={t`Insert below`}
              size="small"
              disabled={isLoading}
              onClick={() => onAppendBody(suggestion.body)}
            />
            <Button
              title={t`Regenerate`}
              Icon={IconRefresh}
              size="small"
              disabled={isLoading}
              onClick={onRegenerate}
            />
          </StyledActions>
        </>
      )}
    </StyledCard>
  );
};
