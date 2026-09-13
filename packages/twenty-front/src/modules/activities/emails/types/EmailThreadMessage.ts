import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type MessageThread } from '@/activities/emails/types/MessageThread';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export type EmailThreadMessage = {
  id: string;
  text: string;
  receivedAt: string | null;
  subject: string;
  headerMessageId: string;
  messageThreadId: string;
  messageParticipants: EmailThreadMessageParticipant[];
  messageThread: MessageThread;
  isDraft: boolean;
  files?: FieldFilesValue[] | null;
  __typename: 'EmailThreadMessage';
};
