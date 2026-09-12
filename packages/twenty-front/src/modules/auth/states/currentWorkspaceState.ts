import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import {
  type EmailAssistantLanguage,
  type EmailAssistantLength,
  type EmailAssistantTone,
} from 'twenty-shared/ai';
import {
  type Application,
  type Role,
  type Workspace,
} from '~/generated-metadata/graphql';

export type CurrentWorkspace = Pick<
  Workspace,
  | 'id'
  | 'inviteHash'
  | 'logo'
  | 'displayName'
  | 'allowImpersonation'
  | 'featureFlags'
  | 'activationStatus'
  | 'billingSubscriptions'
  | 'billingEntitlements'
  | 'billingCustomer'
  | 'currentBillingSubscription'
  | 'workspaceMembersCount'
  | 'isPublicInviteLinkEnabled'
  | 'workspaceDiscoverability'
  | 'isGoogleAuthEnabled'
  | 'isGoogleAuthBypassEnabled'
  | 'isMicrosoftAuthEnabled'
  | 'isMicrosoftAuthBypassEnabled'
  | 'isPasswordAuthEnabled'
  | 'isPasswordAuthBypassEnabled'
  | 'isCustomDomainEnabled'
  | 'hasValidSignedEnterpriseKey'
  | 'hasValidEnterpriseValidityToken'
  | 'subdomain'
  | 'customDomain'
  | 'workspaceUrls'
  | 'isTwoFactorAuthenticationEnforced'
  | 'trashRetentionDays'
  | 'eventLogRetentionDays'
  | 'aiChatModelTier'
  | 'aiAgentModelTier'
  | 'isAutoModelSelectionEnabled'
  | 'aiModelIdByTier'
  | 'aiAdditionalInstructions'
  | 'editableProfileFields'
  | 'isInternalMessagesImportEnabled'
> & {
  // Declared here rather than picked from the generated Workspace until
  // graphql:generate runs against a server carrying the email assistant fields.
  aiEmailInstructions?: string | null;
  aiEmailTone?: EmailAssistantTone;
  aiEmailLanguage?: EmailAssistantLanguage;
  aiEmailLength?: EmailAssistantLength;
  isAiEmailAutoSummaryEnabled?: boolean;
  defaultRole?: Omit<Role, 'workspaceMembers' | 'agents' | 'apiKeys'> | null;
  workspaceCustomApplication: Pick<Application, 'id'> | null;
  installedApplications: Pick<
    Application,
    'id' | 'name' | 'universalIdentifier' | 'logoUrl'
  >[];
};

export const currentWorkspaceState = createAtomState<CurrentWorkspace | null>({
  key: 'currentWorkspaceState',
  defaultValue: null,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
