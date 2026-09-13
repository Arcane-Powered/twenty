import { type EmailAttachment } from 'twenty-shared/types';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageAttachment } from 'src/modules/messaging/message-import-manager/types/message';

export type ComposedEmail = {
  recipients: { to: string[]; cc: string[]; bcc: string[] };
  toRecipientsDisplay: string;
  sanitizedSubject: string;
  plainTextBody: string;
  sanitizedHtmlBody: string;
  attachments: MessageAttachment[];
  files: EmailAttachment[];
  connectedAccount: ConnectedAccountEntity;
  fromHandle?: string;
  messageChannelId?: string;
  shouldPersistMessage: boolean;
  inReplyTo?: string;
  threadExternalId?: string;
  references?: string[];
};
