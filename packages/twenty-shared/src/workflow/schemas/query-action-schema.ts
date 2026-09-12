import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowQueryActionSettingsSchema } from './query-action-settings-schema';

export const workflowQueryActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('QUERY'),
  settings: workflowQueryActionSettingsSchema,
});
