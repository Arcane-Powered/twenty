import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const QUERY_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'QUERY'>;
  icon: string;
} = {
  defaultLabel: 'Query',
  type: 'QUERY',
  icon: 'IconApi',
};
