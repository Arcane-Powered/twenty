export type EmailAssistantMessageInput = {
  senderDisplayName: string;
  senderHandle?: string;
  receivers?: string;
  sentAt?: string;
  text: string;
  isFromWorkspaceMember?: boolean;
};
