import { type WorkflowQueryAction } from '@/workflow/types/Workflow';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export type QueryVariables = NonNullable<
  WorkflowQueryAction['settings']['input']['variables']
>;

export type QueryFormData = {
  query: string;
  variables: QueryVariables;
};

export type UseQueryFormParams = {
  action: WorkflowQueryAction;
  onActionUpdate?: (action: WorkflowQueryAction) => void;
  readonly: boolean;
};

export const useQueryForm = ({
  action,
  onActionUpdate,
  readonly,
}: UseQueryFormParams) => {
  const [formData, setFormData] = useState<QueryFormData>({
    query: action.settings.input.query,
    variables: action.settings.input.variables ?? {},
  });

  const saveAction = useDebouncedCallback((updatedFormData: QueryFormData) => {
    if (readonly) {
      return;
    }

    onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        input: {
          query: updatedFormData.query,
          variables: updatedFormData.variables,
        },
      },
    });
  }, 500);

  const handleFieldChange = <TField extends keyof QueryFormData>(
    field: TField,
    value: QueryFormData[TField],
  ) => {
    const updatedFormData = { ...formData, [field]: value };

    setFormData(updatedFormData);
    saveAction(updatedFormData);
  };

  return { formData, handleFieldChange, saveAction };
};
