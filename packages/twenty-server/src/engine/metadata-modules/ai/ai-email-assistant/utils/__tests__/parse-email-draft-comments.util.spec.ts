import { parseEmailDraftComments } from 'src/engine/metadata-modules/ai/ai-email-assistant/utils/parse-email-draft-comments.util';

describe('parseEmailDraftComments', () => {
  it('parses a JSON answer', () => {
    expect(
      parseEmailDraftComments('{"comments":["Too long.","No date given."]}'),
    ).toEqual(['Too long.', 'No date given.']);
  });

  it('parses a fenced JSON answer', () => {
    expect(
      parseEmailDraftComments('```json\n{"comments":["Too long."]}\n```'),
    ).toEqual(['Too long.']);
  });

  it('reads a bulleted answer', () => {
    expect(
      parseEmailDraftComments(
        'Here is my review:\n- The second question is unanswered.\n* The tone is too casual.\n1. No next step.',
      ),
    ).toEqual([
      'The second question is unanswered.',
      'The tone is too casual.',
      'No next step.',
    ]);
  });

  it('returns nothing when the draft needs no change', () => {
    expect(parseEmailDraftComments('{"comments":[]}')).toEqual([]);
    expect(parseEmailDraftComments('Looks ready to send.')).toEqual([]);
  });
});
