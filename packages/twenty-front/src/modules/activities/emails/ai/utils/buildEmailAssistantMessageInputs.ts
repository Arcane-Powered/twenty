import { type EmailAssistantMessageInput } from '@/activities/emails/ai/types/EmailAssistantMessageInput';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { isNonEmptyString } from '@sniptt/guards';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined, isFieldValueRestricted } from 'twenty-shared/utils';

// Threads can hold messages whose FROM participant was never synced; the
// assistant still reads them rather than dropping their text.
const UNKNOWN_SENDER_DISPLAY_NAME = 'Unknown sender';

export const buildEmailAssistantMessageInputs = (
  messages: EmailThreadMessageWithSender[],
): EmailAssistantMessageInput[] =>
  messages
    .filter(
      (message) =>
        !message.isDraft &&
        !isFieldValueRestricted(message.text) &&
        isNonEmptyString(message.text),
    )
    .map((message) => {
      const receivers = message.messageParticipants
        .filter(
          (participant) => participant.role !== MessageParticipantRole.FROM,
        )
        .map((participant) => getDisplayNameFromParticipant({ participant }))
        .join(', ');

      const { sender } = message;

      return {
        senderDisplayName: isDefined(sender)
          ? getDisplayNameFromParticipant({
              participant: sender,
              shouldUseFullName: true,
            })
          : UNKNOWN_SENDER_DISPLAY_NAME,
        senderHandle: isNonEmptyString(sender?.handle)
          ? sender.handle
          : undefined,
        receivers: isNonEmptyString(receivers) ? receivers : undefined,
        sentAt: message.receivedAt ?? undefined,
        text: message.text,
        isFromWorkspaceMember: isDefined(sender?.workspaceMember),
      };
    });
