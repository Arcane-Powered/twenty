import { styled } from '@linaria/react';
import { useState } from 'react';

import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { plural, t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCollapsedRow = styled.button`
  align-items: center;
  all: unset;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
  transition: ${themeCssVariables.clickableElementBackgroundTransition};
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledCount = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  justify-content: center;
  min-width: ${themeCssVariables.spacing[5]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSeparator = styled.span`
  background: ${themeCssVariables.border.color.light};
  flex: 1;
  height: 1px;
`;

const StyledAction = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

export const EmailThreadIntermediaryMessages = ({
  messages,
  onDraftClick,
  onReplyClick,
}: {
  messages: EmailThreadMessageWithSender[];
  onDraftClick: (message: EmailThreadMessageWithSender) => void;
  onReplyClick?: () => void;
}) => {
  const [areMessagesOpen, setAreMessagesOpen] = useState(false);
  const messagesLength = messages.length;

  if (messagesLength === 0) {
    return null;
  }

  if (areMessagesOpen) {
    return messages.map((message) => (
      <EmailThreadMessage
        key={message.id}
        message={message}
        onDraftClick={onDraftClick}
        onReplyClick={onReplyClick}
      />
    ));
  }

  return (
    <StyledCollapsedRow type="button" onClick={() => setAreMessagesOpen(true)}>
      <StyledCount>{messagesLength}</StyledCount>
      <StyledLabel>
        {plural(messagesLength, {
          one: 'hidden message',
          other: 'hidden messages',
        })}
      </StyledLabel>
      <StyledSeparator />
      <StyledAction>{t`Show`}</StyledAction>
    </StyledCollapsedRow>
  );
};
