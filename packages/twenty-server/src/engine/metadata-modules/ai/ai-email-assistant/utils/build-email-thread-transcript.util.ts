import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  EMAIL_ASSISTANT_TRUNCATION_MARKER,
  MAX_EMAIL_ASSISTANT_MESSAGE_EXCERPT_LENGTH,
  MAX_EMAIL_ASSISTANT_TRANSCRIPT_LENGTH,
} from 'src/engine/metadata-modules/ai/ai-email-assistant/constants/ai-email-assistant.const';
import { type EmailThreadMessageInput } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/email-thread-message.input';

type BuildEmailThreadTranscriptArgs = {
  messages: EmailThreadMessageInput[];
  maxTranscriptLength?: number;
  maxMessageLength?: number;
};

const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength
    ? text
    : `${text.slice(0, maxLength).trimEnd()} ${EMAIL_ASSISTANT_TRUNCATION_MARKER}`;

const formatSender = (message: EmailThreadMessageInput): string => {
  const handle = isNonEmptyString(message.senderHandle)
    ? ` <${message.senderHandle}>`
    : '';
  const side = message.isFromWorkspaceMember === true ? ' (us)' : '';

  return `${message.senderDisplayName}${handle}${side}`;
};

const formatMessage = (
  message: EmailThreadMessageInput,
  maxMessageLength: number,
): string => {
  const lines = [`From: ${formatSender(message)}`];

  if (isNonEmptyString(message.receivers)) {
    lines.push(`To: ${message.receivers}`);
  }

  if (isNonEmptyString(message.sentAt)) {
    lines.push(`Date: ${message.sentAt}`);
  }

  lines.push('', truncate(message.text.trim(), maxMessageLength));

  return lines.join('\n');
};

// The oldest messages are the ones dropped when a thread does not fit: the tail
// of a conversation is what a reply and a summary are actually about.
export const buildEmailThreadTranscript = ({
  messages,
  maxTranscriptLength = MAX_EMAIL_ASSISTANT_TRANSCRIPT_LENGTH,
  maxMessageLength = MAX_EMAIL_ASSISTANT_MESSAGE_EXCERPT_LENGTH,
}: BuildEmailThreadTranscriptArgs): string => {
  const keptBlocks: string[] = [];
  let remainingLength = maxTranscriptLength;
  let droppedMessageCount = 0;

  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];

    if (!isDefined(message)) {
      continue;
    }

    const block = formatMessage(message, maxMessageLength);

    if (block.length > remainingLength && keptBlocks.length > 0) {
      droppedMessageCount = index + 1;
      break;
    }

    keptBlocks.unshift(block);
    remainingLength -= block.length;
  }

  const header =
    droppedMessageCount > 0
      ? [`[${droppedMessageCount} earlier message(s) omitted]`, '']
      : [];

  return [...header, ...keptBlocks].join('\n\n---\n\n');
};
