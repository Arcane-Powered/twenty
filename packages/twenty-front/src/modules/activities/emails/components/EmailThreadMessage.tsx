import { useState } from 'react';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageLayout } from '@/activities/emails/components/EmailThreadMessageLayout';
import { EmailThreadMessageReceivers } from '@/activities/emails/components/EmailThreadMessageReceivers';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { t } from '@lingui/core/macro';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined, isFieldValueRestricted } from 'twenty-shared/utils';
import { IconArrowBackUp } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MessageChannelVisibility } from '~/generated/graphql';

type EmailThreadMessageProps = {
  message: EmailThreadMessageWithSender;
  isExpanded?: boolean;
  hideBottomBorder?: boolean;
  onDraftClick: (message: EmailThreadMessageWithSender) => void;
  onReplyClick?: () => void;
};

export const EmailThreadMessage = ({
  message,
  isExpanded = false,
  hideBottomBorder = false,
  onDraftClick,
  onReplyClick,
}: EmailThreadMessageProps) => {
  const [isOpen, setIsOpen] = useState(isExpanded);

  const receivers = message.messageParticipants.filter(
    (participant) => participant.role !== MessageParticipantRole.FROM,
  );

  if (
    !isDefined(message.sender) ||
    (!message.isDraft && receivers.length === 0)
  ) {
    return null;
  }

  const { isDraft } = message;

  const isRestricted = isFieldValueRestricted(message.text);

  const handleRowClick = () => {
    if (isRestricted) {
      return;
    }

    if (isDraft) {
      onDraftClick(message);

      return;
    }

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleHeaderClick = () => {
    if (!isDraft && isOpen) {
      setIsOpen(false);
    }
  };

  const canReply =
    !isDraft && isOpen && !isRestricted && isDefined(onReplyClick);

  return (
    <EmailThreadMessageLayout
      hideBottomBorder={hideBottomBorder}
      isRowClickable={!isRestricted && (isDraft || !isOpen)}
      isHeaderClickable={!isDraft && isOpen}
      onRowClick={handleRowClick}
      onHeaderClick={handleHeaderClick}
      actions={
        canReply ? (
          <LightIconButton
            Icon={IconArrowBackUp}
            accent="tertiary"
            aria-label={t`Reply`}
            onClick={(event) => {
              event.stopPropagation();
              onReplyClick();
            }}
          />
        ) : undefined
      }
      header={
        <>
          <EmailThreadMessageSender
            sender={message.sender}
            sentAt={message.receivedAt}
            shouldDisplayHandle={!isDraft && isOpen}
          />
          {!isDraft && isOpen && (
            <EmailThreadMessageReceivers receivers={receivers} />
          )}
        </>
      }
    >
      {isRestricted ? (
        <EmailThreadNotShared visibility={MessageChannelVisibility.METADATA} />
      ) : isDraft || !isOpen ? (
        <EmailThreadMessageBodyPreview body={message.text} />
      ) : (
        <EmailThreadMessageBody body={message.text} isDisplayed />
      )}
    </EmailThreadMessageLayout>
  );
};
