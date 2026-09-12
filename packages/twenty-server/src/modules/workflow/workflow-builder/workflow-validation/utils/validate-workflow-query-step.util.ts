import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { type WorkflowQueryAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  parseWorkflowQueryDocument,
  WorkflowQueryDocumentError,
} from 'src/modules/workflow/workflow-executor/workflow-actions/query/utils/parse-workflow-query-document.util';

export const validateWorkflowQueryStep = (
  step: WorkflowQueryAction,
): WorkflowValidationIssue[] => {
  try {
    parseWorkflowQueryDocument(step.settings.input.query);

    return [];
  } catch (error) {
    if (!(error instanceof WorkflowQueryDocumentError)) {
      throw error;
    }

    return [
      {
        severity: 'error',
        code: 'QUERY_STEP_INVALID_DOCUMENT',
        message: `Step "${step.name ?? step.id}" has an invalid query: ${error.message}`,
        stepId: step.id,
      },
    ];
  }
};
