import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowQueryAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowQueryAction = (
  action: WorkflowAction,
): action is WorkflowQueryAction => {
  return action.type === WorkflowActionType.QUERY;
};
