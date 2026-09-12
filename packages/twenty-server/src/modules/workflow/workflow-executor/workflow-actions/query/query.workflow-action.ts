import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import { isWorkflowQueryAction } from 'src/modules/workflow/workflow-executor/workflow-actions/query/guards/is-workflow-query-action.guard';
import { type WorkflowQueryActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/query/types/workflow-query-action-input.type';
import {
  parseWorkflowQueryDocument,
  WorkflowQueryDocumentError,
} from 'src/modules/workflow/workflow-executor/workflow-actions/query/utils/parse-workflow-query-document.util';

@Injectable()
export class QueryWorkflowAction implements WorkflowAction {
  constructor(
    private readonly directExecutionService: DirectExecutionService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (!isWorkflowQueryAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a query action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const input = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowQueryActionInput;

    let parsedDocument: ReturnType<typeof parseWorkflowQueryDocument>;

    try {
      parsedDocument = parseWorkflowQueryDocument(input.query);
    } catch (error) {
      if (error instanceof WorkflowQueryDocumentError) {
        throw new WorkflowStepExecutorException(
          error.message,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      }

      throw error;
    }

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    // The workspace resolvers read their auth context from async local storage,
    // the same way the HTTP API supplies it, so the run's role decides what the
    // document is allowed to read and write.
    const result = await withWorkspaceAuthContext(
      executionContext.authContext,
      () =>
        this.directExecutionService.executeWorkspaceDocument({
          workspaceId: runInfo.workspaceId,
          document: parsedDocument.document,
          operationName: parsedDocument.operationName,
          variables: input.variables,
        }),
    );

    const errorMessages = result?.errors?.map((error) => error.message) ?? [];

    if (errorMessages.length > 0) {
      return {
        result: result?.data ?? {},
        error: errorMessages.join('\n'),
      };
    }

    return { result: result?.data ?? {} };
  }
}
