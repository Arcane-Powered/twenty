import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EmailThreadMessageReceiversProps = {
  receivers: EmailThreadMessageParticipant[];
};

const StyledThreadMessageReceivers = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  min-width: 0;
  width: 100%;
`;

export const EmailThreadMessageReceivers = ({
  receivers,
}: EmailThreadMessageReceiversProps) => {
  const displayedReceivers = receivers
    .map((receiver) => getDisplayNameFromParticipant({ participant: receiver }))
    .join(', ');

  return (
    <StyledThreadMessageReceivers>
      <OverflowingTextWithTooltip text={t`To ${displayedReceivers}`} />
    </StyledThreadMessageReceivers>
  );
};
