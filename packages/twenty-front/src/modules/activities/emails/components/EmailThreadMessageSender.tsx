import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyPastDateRelativeToNow,
  formatToHumanReadableDate,
} from '~/utils/date-utils';
import { isDefined } from 'twenty-shared/utils';

const StyledEmailThreadMessageSender = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
`;

const StyledIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledHandle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledUnknownSender = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledThreadMessageSentAt = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  white-space: nowrap;
`;

type EmailThreadMessageSenderProps = {
  sender?: EmailThreadMessageParticipant;
  sentAt: string | null;
  shouldDisplayHandle?: boolean;
};

export const EmailThreadMessageSender = ({
  sender,
  sentAt,
  shouldDisplayHandle = false,
}: EmailThreadMessageSenderProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  let sentAtContent = null;

  if (isDefined(sentAt)) {
    const tooltipId = `date-tooltip-${sentAt.replace(/[^a-zA-Z0-9]/g, '-')}`;

    sentAtContent = (
      <Tooltip
        delay={TooltipDelay.mediumDelay}
        content={formatToHumanReadableDate(sentAt)}
        side="top"
      >
        <StyledThreadMessageSentAt id={tooltipId}>
          {beautifyPastDateRelativeToNow(sentAt, localeCatalog)}
        </StyledThreadMessageSentAt>
      </Tooltip>
    );
  }

  return (
    <StyledEmailThreadMessageSender>
      {isDefined(sender) ? (
        <StyledIdentity>
          <ParticipantChip participant={sender} variant="bold" />
          {shouldDisplayHandle && isNonEmptyString(sender.handle) && (
            <StyledHandle>{sender.handle}</StyledHandle>
          )}
        </StyledIdentity>
      ) : (
        <StyledUnknownSender>{t`Unknown sender`}</StyledUnknownSender>
      )}
      {sentAtContent}
    </StyledEmailThreadMessageSender>
  );
};
