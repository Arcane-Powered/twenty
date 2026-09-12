import { WORKFLOW_QUERY_MODEL_URI } from '@/workflow/workflow-steps/workflow-actions/query-action/constants/WorkflowQueryModelUri';
import { printSchema, type GraphQLSchema } from 'graphql';
import { type MonacoGraphQLAPI } from 'monaco-graphql';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

// monaco-graphql registers the graphql language service on the Monaco instance
// shared by the whole app, so the mode is initialized once and later schema
// changes are pushed into that same instance.
let monacoGraphqlApi: MonacoGraphQLAPI | undefined;

export const useMonacoGraphqlSchema = (schema: GraphQLSchema | undefined) => {
  useEffect(() => {
    if (!isDefined(schema)) {
      return;
    }

    let isStale = false;

    const configureSchema = async () => {
      // The schema crosses into a web worker, so it travels as SDL rather than
      // as a GraphQLSchema instance, which is not structured-cloneable.
      const schemas = [
        {
          uri: WORKFLOW_QUERY_MODEL_URI,
          fileMatch: [WORKFLOW_QUERY_MODEL_URI],
          documentString: printSchema(schema),
        },
      ];

      if (isDefined(monacoGraphqlApi)) {
        if (!isStale) {
          monacoGraphqlApi.setSchemaConfig(schemas);
        }

        return;
      }

      const { initializeMode } = await import('monaco-graphql/initializeMode');

      if (isStale) {
        return;
      }

      monacoGraphqlApi = initializeMode({ schemas });
    };

    configureSchema();

    return () => {
      isStale = true;
    };
  }, [schema]);
};
