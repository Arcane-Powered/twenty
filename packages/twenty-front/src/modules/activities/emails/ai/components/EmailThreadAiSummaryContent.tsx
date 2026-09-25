import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EmailThreadSummary } from '@/activities/emails/ai/types/EmailThreadSummary';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledSummaryCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSectionTitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledListItem = styled.li`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
`;

type EmailThreadAiSummaryContentProps = {
  summary: EmailThreadSummary;
};

export const EmailThreadAiSummaryContent = ({
  summary,
}: EmailThreadAiSummaryContentProps) => (
  <StyledContainer>
    <StyledSummaryCard>{summary.summary}</StyledSummaryCard>
    {summary.keyPoints.length > 0 && (
      <StyledSection>
        <StyledSectionTitle>{t`Key points`}</StyledSectionTitle>
        <StyledList>
          {summary.keyPoints.map((keyPoint) => (
            <StyledListItem key={keyPoint}>{keyPoint}</StyledListItem>
          ))}
        </StyledList>
      </StyledSection>
    )}
    {summary.nextActions.length > 0 && (
      <StyledSection>
        <StyledSectionTitle>{t`Next actions`}</StyledSectionTitle>
        <StyledList>
          {summary.nextActions.map((nextAction) => (
            <StyledListItem key={nextAction}>{nextAction}</StyledListItem>
          ))}
        </StyledList>
      </StyledSection>
    )}
  </StyledContainer>
);
