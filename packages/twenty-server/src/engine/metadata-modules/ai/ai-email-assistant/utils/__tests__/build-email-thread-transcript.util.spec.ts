import { type EmailThreadMessageInput } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/email-thread-message.input';
import { buildEmailThreadTranscript } from 'src/engine/metadata-modules/ai/ai-email-assistant/utils/build-email-thread-transcript.util';

const buildMessage = (
  overrides: Partial<EmailThreadMessageInput> = {},
): EmailThreadMessageInput => ({
  senderDisplayName: 'Marc Pons',
  senderHandle: 'marc.pons@acme.com',
  receivers: 'me@company.com',
  sentAt: '2026-09-11T17:42:00.000Z',
  text: 'Can you confirm the pricing tier?',
  isFromWorkspaceMember: false,
  ...overrides,
});

describe('buildEmailThreadTranscript', () => {
  it('renders sender, receivers, date and body', () => {
    const transcript = buildEmailThreadTranscript({
      messages: [buildMessage()],
    });

    expect(transcript).toContain('From: Marc Pons <marc.pons@acme.com>');
    expect(transcript).toContain('To: me@company.com');
    expect(transcript).toContain('Date: 2026-09-11T17:42:00.000Z');
    expect(transcript).toContain('Can you confirm the pricing tier?');
  });

  it('marks messages sent by the workspace member', () => {
    const transcript = buildEmailThreadTranscript({
      messages: [buildMessage({ isFromWorkspaceMember: true })],
    });

    expect(transcript).toContain('(us)');
  });

  it('omits optional fields that are missing', () => {
    const transcript = buildEmailThreadTranscript({
      messages: [
        buildMessage({
          senderHandle: undefined,
          receivers: undefined,
          sentAt: undefined,
        }),
      ],
    });

    expect(transcript).toContain('From: Marc Pons');
    expect(transcript).not.toContain('To:');
    expect(transcript).not.toContain('Date:');
  });

  it('truncates a message longer than the message budget', () => {
    const transcript = buildEmailThreadTranscript({
      messages: [buildMessage({ text: 'a'.repeat(100) })],
      maxMessageLength: 20,
    });

    expect(transcript).toContain('[…]');
    expect(transcript).not.toContain('a'.repeat(30));
  });

  it('drops the oldest messages when the thread does not fit', () => {
    const transcript = buildEmailThreadTranscript({
      messages: [
        buildMessage({ text: 'oldest message' }),
        buildMessage({ text: 'middle message' }),
        buildMessage({ text: 'newest message' }),
      ],
      maxTranscriptLength: 200,
    });

    expect(transcript).toContain('newest message');
    expect(transcript).not.toContain('oldest message');
    expect(transcript).toContain('earlier message(s) omitted');
  });

  it('keeps the newest message even when it alone exceeds the budget', () => {
    const transcript = buildEmailThreadTranscript({
      messages: [buildMessage({ text: 'only message' })],
      maxTranscriptLength: 1,
    });

    expect(transcript).toContain('only message');
  });
});
