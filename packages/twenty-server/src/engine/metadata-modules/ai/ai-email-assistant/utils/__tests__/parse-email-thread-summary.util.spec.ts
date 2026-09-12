import { parseEmailThreadSummary } from 'src/engine/metadata-modules/ai/ai-email-assistant/utils/parse-email-thread-summary.util';

describe('parseEmailThreadSummary', () => {
  it('parses a plain JSON answer', () => {
    const parsed = parseEmailThreadSummary(
      '{"summary":"Acme wants to renew.","keyPoints":["250 seats"],"nextActions":["Send the DPA"],"awaitsReply":true}',
    );

    expect(parsed).toEqual({
      summary: 'Acme wants to renew.',
      keyPoints: ['250 seats'],
      nextActions: ['Send the DPA'],
      awaitsReply: true,
    });
  });

  it('parses an answer wrapped in a code fence', () => {
    const parsed = parseEmailThreadSummary(
      '```json\n{"summary":"Acme wants to renew.","keyPoints":[],"nextActions":[],"awaitsReply":false}\n```',
    );

    expect(parsed.summary).toBe('Acme wants to renew.');
  });

  it('parses an answer surrounded by prose', () => {
    const parsed = parseEmailThreadSummary(
      'Here you go: {"summary":"Renewal in progress.","keyPoints":["a"],"nextActions":[],"awaitsReply":false} Hope this helps.',
    );

    expect(parsed.summary).toBe('Renewal in progress.');
    expect(parsed.keyPoints).toEqual(['a']);
  });

  it('falls back to the raw text when the answer is not JSON', () => {
    const parsed = parseEmailThreadSummary('  Acme is renewing.  ');

    expect(parsed).toEqual({
      summary: 'Acme is renewing.',
      keyPoints: [],
      nextActions: [],
      awaitsReply: false,
    });
  });

  it('drops list entries that are not strings', () => {
    const parsed = parseEmailThreadSummary(
      '{"summary":"s","keyPoints":["a",null,3,"  b  "],"nextActions":"nope","awaitsReply":"yes"}',
    );

    expect(parsed.keyPoints).toEqual(['a', 'b']);
    expect(parsed.nextActions).toEqual([]);
    expect(parsed.awaitsReply).toBe(false);
  });
});
