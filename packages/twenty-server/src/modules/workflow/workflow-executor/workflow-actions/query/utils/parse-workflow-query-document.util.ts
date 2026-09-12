import { Kind, parse, type DocumentNode } from 'graphql';

export type ParsedWorkflowQueryDocument = {
  document: DocumentNode;
  operationName?: string;
  operation: 'query' | 'mutation';
};

export class WorkflowQueryDocumentError extends Error {}

export const parseWorkflowQueryDocument = (
  query: string,
): ParsedWorkflowQueryDocument => {
  if (query.trim() === '') {
    throw new WorkflowQueryDocumentError('Query is empty');
  }

  let document: DocumentNode;

  try {
    document = parse(query);
  } catch (error) {
    throw new WorkflowQueryDocumentError(
      `Query could not be parsed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const operations = document.definitions.filter(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION,
  );

  if (operations.length === 0) {
    throw new WorkflowQueryDocumentError(
      'Query must contain one operation, found none',
    );
  }

  // The step maps a single result object into the workflow context, so a
  // document holding several operations has no unambiguous output.
  if (operations.length > 1) {
    throw new WorkflowQueryDocumentError(
      `Query must contain exactly one operation, found ${operations.length}`,
    );
  }

  const operation = operations[0];

  if (operation.operation === 'subscription') {
    throw new WorkflowQueryDocumentError(
      'Subscriptions are not supported in a query step',
    );
  }

  return {
    document,
    operationName: operation.name?.value,
    operation: operation.operation,
  };
};
