import { type EmailAssistantMessageInput } from '@/activities/emails/ai/types/EmailAssistantMessageInput';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { isNonEmptyString } from '@sniptt/guards';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined, isFieldValueRestricted } from 'twenty-shared/utils';

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

      return {
        senderDisplayName: getDisplayNameFromParticipant({
          participant: message.sender,
          shouldUseFullName: true,
        }),
        senderHandle: isNonEmptyString(message.sender.handle)
          ? message.sender.handle
          : undefined,
        receivers: isNonEmptyString(receivers) ? receivers : undefined,
        sentAt: message.receivedAt ?? undefined,
        text: message.text,
        isFromWorkspaceMember: isDefined(message.sender.workspaceMember),
      };
    });
