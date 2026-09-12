import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowQueryActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      query: z
        .string()
        .describe(
          'GraphQL document executed against the workspace schema. Must contain exactly one operation.',
        ),
      variables: z
        .record(z.string(), z.json())
        .optional()
        .describe(
          'Variable values for the document. Values support {{stepId.fieldName}} interpolation.',
        ),
    }),
  });
