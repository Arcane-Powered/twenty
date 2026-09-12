export const MAX_EMAIL_ASSISTANT_MESSAGE_LENGTH = 20_000;

export const MAX_EMAIL_ASSISTANT_THREAD_MESSAGES = 50;

// Roughly 6k tokens of thread, which leaves room for the instructions and the
// answer on every model tier the workspace can pick.
export const MAX_EMAIL_ASSISTANT_TRANSCRIPT_LENGTH = 24_000;

export const MAX_EMAIL_ASSISTANT_MESSAGE_EXCERPT_LENGTH = 4_000;

export const EMAIL_ASSISTANT_TRUNCATION_MARKER = '[…]';
