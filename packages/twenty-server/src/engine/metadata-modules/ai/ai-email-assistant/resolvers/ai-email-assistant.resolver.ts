import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingGraphqlApiExceptionFilter } from 'src/engine/core-modules/billing/filters/billing-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { EmailDraftSuggestionDTO } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/email-draft-suggestion.dto';
import { EmailThreadSummaryDTO } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/email-thread-summary.dto';
import { GenerateEmailDraftInput } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/generate-email-draft.input';
import { SummarizeEmailThreadInput } from 'src/engine/metadata-modules/ai/ai-email-assistant/dtos/summarize-email-thread.input';
import { AiEmailAssistantService } from 'src/engine/metadata-modules/ai/ai-email-assistant/services/ai-email-assistant.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@UsePipes(ResolverValidationPipe)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  BillingGraphqlApiExceptionFilter,
)
@MetadataResolver()
export class AiEmailAssistantResolver {
  constructor(
    private readonly aiEmailAssistantService: AiEmailAssistantService,
  ) {}

  @Mutation(() => EmailThreadSummaryDTO)
  async summarizeEmailThread(
    @Args('input') input: SummarizeEmailThreadInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<EmailThreadSummaryDTO> {
    return this.aiEmailAssistantService.summarizeThread({
      workspace,
      userWorkspaceId,
      input,
    });
  }

  @Mutation(() => EmailDraftSuggestionDTO)
  async generateEmailDraft(
    @Args('input') input: GenerateEmailDraftInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<EmailDraftSuggestionDTO> {
    return this.aiEmailAssistantService.generateDraft({
      workspace,
      userWorkspaceId,
      input,
    });
  }
}
