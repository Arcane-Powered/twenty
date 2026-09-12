import { buildEmailAssistantGuidelines } from 'src/engine/metadata-modules/ai/ai-email-assistant/utils/build-email-assistant-guidelines.util';

describe('buildEmailAssistantGuidelines', () => {
  it('describes tone, length and language', () => {
    const guidelines = buildEmailAssistantGuidelines({
      instructions: null,
      tone: 'direct',
      language: 'fr',
      length: 'detailed',
    });

    expect(guidelines).toContain('Short sentences');
    expect(guidelines).toContain('up to 350 words');
    expect(guidelines).toContain('Write in French.');
  });

  it('lets the thread decide the language when set to auto', () => {
    const guidelines = buildEmailAssistantGuidelines({
      instructions: null,
      tone: 'professional',
      language: 'auto',
      length: 'concise',
    });

    expect(guidelines).toContain(
      'language of the most recent received message',
    );
  });

  it('appends the workspace context when there is one', () => {
    const guidelines = buildEmailAssistantGuidelines({
      instructions: '  Never promise a discount above 15%.  ',
      tone: 'professional',
      language: 'auto',
      length: 'concise',
    });

    expect(guidelines).toContain('# Workspace context');
    expect(guidelines).toContain('Never promise a discount above 15%.');
  });

  it('omits the workspace context section when it is empty', () => {
    const guidelines = buildEmailAssistantGuidelines({
      instructions: '   ',
      tone: 'professional',
      language: 'auto',
      length: 'concise',
    });

    expect(guidelines).not.toContain('# Workspace context');
  });
});
