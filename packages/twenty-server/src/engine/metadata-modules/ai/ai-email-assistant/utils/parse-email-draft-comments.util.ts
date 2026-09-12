import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

const CODE_FENCE = /^```(?:json)?\s*|\s*```$/g;
const LIST_MARKER = /^\s*(?:[-*•]|\d+[.)])\s+/;

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(isNonEmptyString).map((item) => item.trim())
    : [];

const parseJsonComments = (text: string): string[] | null => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(text.slice(firstBrace, lastBrace + 1));

    return isPlainObject(parsed) ? toStringList(parsed.comments) : null;
  } catch {
    return null;
  }
};

// A review that came back as a bulleted list is still a usable review, so the
// list shape is read rather than dropped.
export const parseEmailDraftComments = (text: string): string[] => {
  const unfenced = text.trim().replace(CODE_FENCE, '');
  const jsonComments = parseJsonComments(unfenced);

  if (jsonComments !== null) {
    return jsonComments;
  }

  return unfenced
    .split('\n')
    .filter((line) => LIST_MARKER.test(line))
    .map((line) => line.replace(LIST_MARKER, '').trim())
    .filter(isNonEmptyString);
};
