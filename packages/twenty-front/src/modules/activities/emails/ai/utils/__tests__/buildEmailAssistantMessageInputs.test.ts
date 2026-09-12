import { buildEmailAssistantMessageInputs } from '@/activities/emails/ai/utils/buildEmailAssistantMessageInputs';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageParticipantRole } from 'twenty-shared/types';

const buildParticipant = (
  overrides: Record<string, unknown> = {},
): EmailThreadMessageWithSender['sender'] =>
  ({
    id: 'participant-id',
    displayName: 'Marc Pons',
    handle: 'marc.pons@acme.com',
    role: MessageParticipantRole.FROM,
    messageId: 'message-id',
    person: null,
    workspaceMember: null,
    __typename: 'EmailThreadMessageParticipant',
    ...overrides,
  }) as unknown as EmailThreadMessageWithSender['sender'];

const buildMessage = (
  overrides: Partial<EmailThreadMessageWithSender> = {},
): EmailThreadMessageWithSender =>
  ({
    id: 'message-id',
    text: 'Can you confirm the pricing tier?',
    receivedAt: '2026-09-11T17:42:00.000Z',
    subject: 'Renewal',
    headerMessageId: 'header-id',
    messageThreadId: 'thread-id',
    isDraft: false,
    sender: buildParticipant(),
    messageParticipants: [
      buildParticipant(),
      buildParticipant({
        id: 'receiver-id',
        displayName: 'Claire Lefèvre',
        handle: 'claire@acme.com',
        role: MessageParticipantRole.TO,
      }),
    ],
    __typename: 'EmailThreadMessage',
    ...overrides,
  }) as unknown as EmailThreadMessageWithSender;

describe('buildEmailAssistantMessageInputs', () => {
  it('maps a message to the assistant input shape', () => {
    expect(buildEmailAssistantMessageInputs([buildMessage()])).toEqual([
      {
        senderDisplayName: 'Marc Pons',
        senderHandle: 'marc.pons@acme.com',
        receivers: 'Claire Lefèvre',
        sentAt: '2026-09-11T17:42:00.000Z',
        text: 'Can you confirm the pricing tier?',
        isFromWorkspaceMember: false,
      },
    ]);
  });

  it('marks messages sent by a workspace member', () => {
    const [input] = buildEmailAssistantMessageInputs([
      buildMessage({
        sender: buildParticipant({
          workspaceMember: { id: 'member-id', name: { firstName: 'Rayane' } },
        }),
      }),
    ]);

    expect(input.isFromWorkspaceMember).toBe(true);
  });

  it('drops drafts, empty messages and restricted messages', () => {
    expect(
      buildEmailAssistantMessageInputs([
        buildMessage({ id: 'draft', isDraft: true }),
        buildMessage({ id: 'empty', text: '' }),
        buildMessage({
          id: 'restricted',
          text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        }),
      ]),
    ).toEqual([]);
  });
});
