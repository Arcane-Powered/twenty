import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

type ParsedEmailThreadSummary = {
  summary: string;
  keyPoints: string[];
  nextActions: string[];
  awaitsReply: boolean;
};

const CODE_FENCE = /^```(?:json)?\s*|\s*```$/g;

const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(isNonEmptyString).map((item) => item.trim())
    : [];

const extractJsonObject = (text: string): unknown => {
  const unfenced = text.trim().replace(CODE_FENCE, '');
  const firstBrace = unfenced.indexOf('{');
  const lastBrace = unfenced.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(unfenced.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
};

// Models occasionally answer with prose or wrap the object in a code fence, and
// a thread summary is worth showing even when its structure did not survive.
export const parseEmailThreadSummary = (
  text: string,
): ParsedEmailThreadSummary => {
  const parsed = extractJsonObject(text);

  if (!isPlainObject(parsed)) {
    return {
      summary: text.trim(),
      keyPoints: [],
      nextActions: [],
      awaitsReply: false,
    };
  }

  const summary = isNonEmptyString(parsed.summary)
    ? parsed.summary.trim()
    : text.trim();

  return {
    summary,
    keyPoints: toStringList(parsed.keyPoints),
    nextActions: toStringList(parsed.nextActions),
    awaitsReply: parsed.awaitsReply === true,
  };
};
