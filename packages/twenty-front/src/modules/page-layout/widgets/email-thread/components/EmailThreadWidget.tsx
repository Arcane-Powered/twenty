import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useCallback, useState } from 'react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailThreadAiPanel } from '@/activities/emails/ai/components/EmailThreadAiPanel';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { useReplyContext } from '@/activities/emails/hooks/useReplyContext';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getEmailDraftPrefillFromMessage } from '@/activities/emails/utils/getEmailDraftPrefillFromMessage';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { EmailThreadComposer } from '@/page-layout/widgets/email-thread/components/EmailThreadComposer';
import { EmailThreadIntermediaryMessages } from '@/page-layout/widgets/email-thread/components/EmailThreadIntermediaryMessages';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { IconSparkles } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const MESSAGES_BEFORE_AUTOMATIC_SUMMARY = 3;
const ASSISTANT_PANEL_WIDTH = '340px';

const StyledThreadLayout = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const StyledThreadColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const StyledAssistantColumn = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  width: ${ASSISTANT_PANEL_WIDTH};
`;

const StyledAssistantSection = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  max-height: 50%;
`;

const StyledToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledMessageCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type EmailThreadWidgetProps = {
  widget: PageLayoutWidget;
};

export const EmailThreadWidget = ({
  widget: _widget,
}: EmailThreadWidgetProps) => {
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { thread, messages, fetchMoreMessages, threadLoading } = useEmailThread(
    targetRecord.id,
  );

  const replyContext = useReplyContext(targetRecord.id);

  const [composerIntent, setComposerIntent] = useState<
    'opened' | 'closed' | null
  >(null);
  const [clickedDraftPrefill, setClickedDraftPrefill] =
    useState<EmailDraftPrefill | null>(null);
  const [assistantIntent, setAssistantIntent] = useState<
    'opened' | 'closed' | null
  >(null);
  const [previousTargetRecordId, setPreviousTargetRecordId] = useState(
    targetRecord.id,
  );

  if (previousTargetRecordId !== targetRecord.id) {
    setPreviousTargetRecordId(targetRecord.id);
    setComposerIntent(null);
    setClickedDraftPrefill(null);
    setAssistantIntent(null);
  }

  const handleComposerOpenChange = useCallback((open: boolean) => {
    setComposerIntent(open ? 'opened' : 'closed');

    if (!open) {
      setClickedDraftPrefill(null);
    }
  }, []);

  const handleDraftClick = useCallback(
    (message: EmailThreadMessageWithSender) => {
      setClickedDraftPrefill(getEmailDraftPrefillFromMessage(message));
      setComposerIntent('opened');
    },
    [],
  );

  const handleReplyClick = useCallback(() => {
    setComposerIntent('opened');
  }, []);

  const canReply = isDefined(replyContext) && !replyContext.loading;

  const messagesCount = messages.length;
  const is5OrMoreMessages = messagesCount >= 5;
  const firstMessages = messages.slice(
    0,
    is5OrMoreMessages ? 2 : messagesCount - 1,
  );
  const intermediaryMessages = is5OrMoreMessages
    ? messages.slice(2, messagesCount - 1)
    : [];
  const lastMessage = messages[messagesCount - 1];

  const trailingDraft = lastMessage?.isDraft ? lastMessage : undefined;
  const draftPrefill =
    clickedDraftPrefill ??
    (isDefined(trailingDraft)
      ? getEmailDraftPrefillFromMessage(trailingDraft)
      : null);
  const isComposerOpen =
    composerIntent === 'opened' ||
    (composerIntent === null && isDefined(trailingDraft));

  const isAssistantOpenedByDefault =
    !isInSidePanel &&
    (currentWorkspace?.isAiEmailAutoSummaryEnabled ?? false) &&
    messagesCount >= MESSAGES_BEFORE_AUTOMATIC_SUMMARY;
  const isAssistantOpen =
    hasAiPermission &&
    (assistantIntent === 'opened' ||
      (assistantIntent === null && isAssistantOpenedByDefault));

  if (threadLoading) {
    return (
      <StyledWidgetContentContainer>
        <WidgetRelationsHeader />
        <StyledWidgetScrollContainer>
          <EmailLoader loadingText={t`Loading thread`} />
        </StyledWidgetScrollContainer>
      </StyledWidgetContentContainer>
    );
  }

  if (!isDefined(thread) || !isDefined(lastMessage)) {
    return (
      <StyledWidgetContentContainer>
        <WidgetRelationsHeader />
        <StyledWidgetScrollContainer>
          <EmptyState.Root>
            <AnimatedPlaceholder type="emptyInbox" />
            <EmptyState.Content>
              <EmptyState.Title>{t`No messages to show`}</EmptyState.Title>
              <EmptyState.Description>
                {t`The messages in this thread are missing or incomplete.`}
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState.Root>
        </StyledWidgetScrollContainer>
      </StyledWidgetContentContainer>
    );
  }

  const assistantPanel = (
    <EmailThreadAiPanel
      messageThreadId={targetRecord.id}
      subject={lastMessage.subject}
      messages={messages}
      shouldGenerateOnOpen={
        assistantIntent === null && isAssistantOpenedByDefault
      }
      onClose={() => setAssistantIntent('closed')}
    />
  );

  return (
    <StyledWidgetContentContainer>
      <WidgetRelationsHeader />
      <StyledThreadLayout>
        <StyledThreadColumn>
          {hasAiPermission && (
            <StyledToolbar>
              <StyledMessageCount>
                {t`${messagesCount} messages`}
              </StyledMessageCount>
              {!isAssistantOpen && (
                <Button
                  startIcon={<IconSparkles />}
                  size="sm"
                  onClick={() => setAssistantIntent('opened')}
                >
                  {t`Assistant`}
                </Button>
              )}
            </StyledToolbar>
          )}
          {isAssistantOpen && isInSidePanel && (
            <StyledAssistantSection>{assistantPanel}</StyledAssistantSection>
          )}
          <StyledWidgetScrollContainer>
            {firstMessages.map((message) => (
              <EmailThreadMessage
                key={message.id}
                message={message}
                onDraftClick={handleDraftClick}
                onReplyClick={canReply ? handleReplyClick : undefined}
              />
            ))}
            <EmailThreadIntermediaryMessages
              messages={intermediaryMessages}
              onDraftClick={handleDraftClick}
              onReplyClick={canReply ? handleReplyClick : undefined}
            />
            <EmailThreadMessage
              key={lastMessage.id}
              message={lastMessage}
              isExpanded
              hideBottomBorder={!isComposerOpen}
              onDraftClick={handleDraftClick}
              onReplyClick={canReply ? handleReplyClick : undefined}
            />
            <CustomResolverFetchMoreLoader
              loading={threadLoading}
              onLastRowVisible={fetchMoreMessages}
            />
          </StyledWidgetScrollContainer>
          {canReply && (
            <EmailThreadComposer
              key={draftPrefill?.messageId ?? 'reply'}
              replyContext={replyContext}
              isInSidePanel={isInSidePanel}
              isComposerOpen={isComposerOpen}
              setIsComposerOpen={handleComposerOpenChange}
              draftPrefill={draftPrefill}
              messageThreadId={targetRecord.id}
              threadMessages={messages}
            />
          )}
        </StyledThreadColumn>
        {isAssistantOpen && !isInSidePanel && (
          <StyledAssistantColumn>{assistantPanel}</StyledAssistantColumn>
        )}
      </StyledThreadLayout>
    </StyledWidgetContentContainer>
  );
};
