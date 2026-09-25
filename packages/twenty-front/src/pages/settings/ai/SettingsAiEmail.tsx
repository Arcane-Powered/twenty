import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  type EmailAssistantLanguage,
  type EmailAssistantLength,
  type EmailAssistantTone,
} from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconLanguage,
  IconMoodSmile,
  IconSparkles,
  IconTextSize,
} from 'twenty-ui/icon';
import { Section, useToast } from 'twenty-ui/components';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';

import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { AI_INSTRUCTIONS_EDITOR_PROFILE } from '@/ai/constants/AiInstructionsEditorProfile';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { UPDATE_EMAIL_ASSISTANT_SETTINGS } from '@/settings/ai/graphql/mutations/updateEmailAssistantSettings';
import { Select } from '@/ui/input/components/Select';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

type EmailAssistantSettingsInput = {
  aiEmailInstructions?: string | null;
  aiEmailTone?: EmailAssistantTone;
  aiEmailLanguage?: EmailAssistantLanguage;
  aiEmailLength?: EmailAssistantLength;
  isAiEmailAutoSummaryEnabled?: boolean;
};

export const SettingsAiEmail = () => {
  const { enqueueToast } = useToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateEmailAssistantSettings] = useMutation(
    UPDATE_EMAIL_ASSISTANT_SETTINGS,
  );

  const initialInstructions = currentWorkspace?.aiEmailInstructions ?? '';
  const [instructions, setInstructions] = useState(initialInstructions);

  const saveSettings = async (input: EmailAssistantSettingsInput) => {
    if (!currentWorkspace) {
      return;
    }

    const previousWorkspace = currentWorkspace;

    setCurrentWorkspace({ ...currentWorkspace, ...input });

    try {
      await updateEmailAssistantSettings({ variables: { input } });
    } catch {
      setCurrentWorkspace(previousWorkspace);
      enqueueToast({
        variant: 'error',
        children: t`Failed to save the email assistant settings`,
      });
    }
  };

  const saveInstructions = useDebouncedCallback(
    (nextInstructions: string) =>
      saveSettings({ aiEmailInstructions: nextInstructions || null }),
    500,
  );

  return (
    <SettingsPageLayout
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        { children: t`Emails` },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`Context`}
            description={t`Added to every thread summary and to every draft the assistant writes.`}
          />
          <StyledFormContainer>
            <FormAdvancedTextFieldInput
              key={initialInstructions}
              readonly={false}
              defaultValue={instructions}
              profile={AI_INSTRUCTIONS_EDITOR_PROFILE}
              onChange={(value) => {
                setInstructions(value);
                saveInstructions(value);
              }}
              enableFullScreen={true}
              fullScreenBreadcrumbs={[
                { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
                { children: t`Emails` },
              ]}
              placeholder={t`E.g., "We sell to RevOps teams. Never promise a discount above 15%."`}
              minHeight={150}
            />
          </StyledFormContainer>
        </Section.Root>

        <Section.Root>
          <Section.Header
            title={t`Writing style`}
            description={t`Defaults for generated drafts. They can be changed message by message.`}
          />
          <Card rounded>
            <SettingsOptionCardContentSelect
              Icon={IconMoodSmile}
              title={t`Tone`}
              description={t`How the assistant addresses your contacts.`}
              divider
            >
              <Select<EmailAssistantTone>
                dropdownId="settings-ai-email-tone"
                selectSizeVariant="small"
                value={currentWorkspace?.aiEmailTone ?? 'professional'}
                options={[
                  { value: 'professional', label: t`Professional` },
                  { value: 'friendly', label: t`Friendly` },
                  { value: 'direct', label: t`Direct` },
                  { value: 'warm', label: t`Warm` },
                ]}
                onChange={(aiEmailTone) => saveSettings({ aiEmailTone })}
              />
            </SettingsOptionCardContentSelect>
            <SettingsOptionCardContentSelect
              Icon={IconLanguage}
              title={t`Language`}
              description={t`Which language drafts are written in.`}
              divider
            >
              <Select<EmailAssistantLanguage>
                dropdownId="settings-ai-email-language"
                selectSizeVariant="small"
                value={currentWorkspace?.aiEmailLanguage ?? 'auto'}
                options={[
                  { value: 'auto', label: t`Same as the thread` },
                  { value: 'en', label: t`English` },
                  { value: 'fr', label: t`French` },
                  { value: 'es', label: t`Spanish` },
                  { value: 'de', label: t`German` },
                  { value: 'it', label: t`Italian` },
                  { value: 'pt', label: t`Portuguese` },
                  { value: 'nl', label: t`Dutch` },
                ]}
                onChange={(aiEmailLanguage) =>
                  saveSettings({ aiEmailLanguage })
                }
              />
            </SettingsOptionCardContentSelect>
            <SettingsOptionCardContentSelect
              Icon={IconTextSize}
              title={t`Length`}
              description={t`How long a generated reply should be.`}
            >
              <Select<EmailAssistantLength>
                dropdownId="settings-ai-email-length"
                selectSizeVariant="small"
                value={currentWorkspace?.aiEmailLength ?? 'concise'}
                options={[
                  { value: 'concise', label: t`Concise` },
                  { value: 'balanced', label: t`Balanced` },
                  { value: 'detailed', label: t`Detailed` },
                ]}
                onChange={(aiEmailLength) => saveSettings({ aiEmailLength })}
              />
            </SettingsOptionCardContentSelect>
          </Card>
        </Section.Root>

        <Section.Root>
          <Section.Header
            title={t`Behaviour`}
            description={t`When the assistant steps in on its own.`}
          />
          <Card rounded>
            <SettingsOptionCardContentSwitch
              Icon={IconSparkles}
              title={t`Summarize long threads on open`}
              description={t`Threads with at least three messages are summarized as soon as they open.`}
              checked={currentWorkspace?.isAiEmailAutoSummaryEnabled ?? false}
              onChange={(isAiEmailAutoSummaryEnabled) =>
                saveSettings({ isAiEmailAutoSummaryEnabled })
              }
            />
          </Card>
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
