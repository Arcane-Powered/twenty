import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { type WorkflowQueryAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WORKFLOW_QUERY_MODEL_URI } from '@/workflow/workflow-steps/workflow-actions/query-action/constants/WorkflowQueryModelUri';
import { useMonacoGraphqlSchema } from '@/workflow/workflow-steps/workflow-actions/query-action/hooks/useMonacoGraphqlSchema';
import {
  useQueryForm,
  type QueryVariables,
} from '@/workflow/workflow-steps/workflow-actions/query-action/hooks/useQueryForm';
import { useWorkspaceGraphqlSchema } from '@/workflow/workflow-steps/workflow-actions/query-action/hooks/useWorkspaceGraphqlSchema';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { useEffect } from 'react';
import { CodeEditor, InputLabel } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const QUERY_EDITOR_HEIGHT = 320;

type WorkflowEditActionQueryProps = {
  action: WorkflowQueryAction;
  actionOptions: {
    readonly?: boolean;
    onActionUpdate?: (action: WorkflowQueryAction) => void;
  };
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const WorkflowEditActionQuery = ({
  action,
  actionOptions,
}: WorkflowEditActionQueryProps) => {
  const { t } = useLingui();
  const readonly = actionOptions.readonly === true;

  const { formData, handleFieldChange, saveAction } = useQueryForm({
    action,
    onActionUpdate: actionOptions.onActionUpdate,
    readonly,
  });

  const { schema, isLoading } = useWorkspaceGraphqlSchema();

  useMonacoGraphqlSchema(schema);

  useEffect(() => () => saveAction.flush(), [saveAction]);

  // The model needs the uri the schema was registered against, otherwise the
  // language service has no schema to complete and validate against.
  const handleEditorMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    const modelUri = monaco.Uri.file(WORKFLOW_QUERY_MODEL_URI);
    const existingModel = monaco.editor.getModel(modelUri);

    editorInstance.setModel(
      existingModel ??
        monaco.editor.createModel(formData.query, 'graphql', modelUri),
    );
  };

  return (
    <WorkflowStepBody>
      <StyledContainer>
        <StyledSection>
          <InputLabel>{t`Query`}</InputLabel>
          <CodeEditor
            value={formData.query}
            language="graphql"
            height={QUERY_EDITOR_HEIGHT}
            isLoading={isLoading}
            onMount={handleEditorMount}
            onChange={(value) => handleFieldChange('query', value)}
            options={{ readOnly: readonly }}
          />
        </StyledSection>

        <StyledSection>
          <InputLabel>{t`Variables`}</InputLabel>
          <FormRawJsonFieldInput
            placeholder={t`{ "companyId": "{{trigger.record.id}}" }`}
            readonly={readonly}
            defaultValue={JSON.stringify(formData.variables, null, 2)}
            onChange={(value) =>
              handleFieldChange('variables', (value ?? {}) as QueryVariables)
            }
            VariablePicker={WorkflowVariablePicker}
          />
        </StyledSection>
      </StyledContainer>
    </WorkflowStepBody>
  );
};
