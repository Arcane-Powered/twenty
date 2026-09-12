import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

import { type WorkflowQueryActionInput } from './workflow-query-action-input.type';

export type WorkflowQueryActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowQueryActionInput;
};
