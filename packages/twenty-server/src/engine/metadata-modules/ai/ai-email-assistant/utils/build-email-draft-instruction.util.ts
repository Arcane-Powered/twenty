import { isNonEmptyString } from '@sniptt/guards';
import { type EmailDraftMode } from 'twenty-shared/ai';

type BuildEmailDraftInstructionArgs = {
  mode: EmailDraftMode;
  instruction?: string;
  hasCurrentBody: boolean;
};

const TASK_BY_MODE: Record<EmailDraftMode, string> = {
  reply:
    'Write a reply to the last message of the thread. Answer every question it asks, and commit to nothing that the thread or the workspace context does not support.',
  fixGrammar:
    'Fix spelling, grammar, punctuation and agreement in the draft. Keep the wording, the tone and the structure of the author: this is a correction, not a rewrite.',
  review:
    'Review the draft and list what is worth changing before sending: unclear passages, unanswered questions, risky commitments, wrong register. Do not rewrite it.',
  shorten:
    'Make the draft shorter while keeping every piece of information and every commitment it contains.',
  expand:
    'Develop the draft: make the reasoning explicit and answer the open points of the thread, without inventing facts.',
  changeTone:
    'Rewrite the draft in the requested tone. Keep the same information and the same commitments.',
  custom:
    'Apply the request below to the draft, or write the message from the thread when there is no draft yet.',
};

export const buildEmailDraftInstruction = ({
  mode,
  instruction,
  hasCurrentBody,
}: BuildEmailDraftInstructionArgs): string => {
  const sections = [`# Task\n${TASK_BY_MODE[mode]}`];

  if (isNonEmptyString(instruction)) {
    sections.push(`# User request\n${instruction.trim()}`);
  }

  if (!hasCurrentBody && mode !== 'reply') {
    sections.push(
      '# Note\nThe draft is empty, so write the message from the thread instead.',
    );
  }

  return sections.join('\n\n');
};
