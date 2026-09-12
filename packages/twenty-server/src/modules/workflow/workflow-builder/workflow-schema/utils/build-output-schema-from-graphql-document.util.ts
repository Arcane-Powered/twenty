import {
  getNamedType,
  isEnumType,
  isInterfaceType,
  isListType,
  isObjectType,
  isScalarType,
  isUnionType,
  Kind,
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLNamedType,
  type GraphQLOutputType,
  type GraphQLSchema,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { type InputSchemaPropertyType } from 'src/modules/workflow/workflow-builder/workflow-schema/types/input-schema.type';
import {
  type Leaf,
  type Node,
  type OutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

// Guards against a selection set that recurses forever through a cyclic schema
// (company -> people -> company -> ...). Deeper selections still execute, they
// just stop contributing mappable variables.
const MAX_SELECTION_DEPTH = 12;

const SCALAR_LEAF_TYPES: Record<string, InputSchemaPropertyType> = {
  Boolean: 'boolean',
  Float: 'number',
  Int: 'number',
  ID: 'string',
  String: 'string',
  Date: 'string',
  DateTime: 'string',
  UUID: 'string',
  BigFloat: 'number',
  Cursor: 'string',
  JSON: 'unknown',
  RawJSON: 'unknown',
};

type FragmentMap = Record<string, FragmentDefinitionNode>;

const getLeafTypeForNamedType = (
  namedType: GraphQLNamedType,
): InputSchemaPropertyType => {
  if (isEnumType(namedType)) {
    return 'string';
  }

  return SCALAR_LEAF_TYPES[namedType.name] ?? 'unknown';
};

const getLeafSampleValue = (
  namedType: GraphQLNamedType,
  leafType: InputSchemaPropertyType,
) => {
  if (isEnumType(namedType)) {
    return namedType.getValues()[0]?.value ?? null;
  }

  return generateFakeValue(leafType);
};

const buildFragmentMap = (document: DocumentNode): FragmentMap =>
  Object.fromEntries(
    document.definitions
      .filter(
        (definition): definition is FragmentDefinitionNode =>
          definition.kind === Kind.FRAGMENT_DEFINITION,
      )
      .map((definition) => [definition.name.value, definition]),
  );

// A selection set can spread fragments at any level, so field nodes are
// collected recursively before any of them is resolved against the schema.
const collectFieldNodes = ({
  selectionSet,
  fragmentMap,
  seenFragmentNames,
}: {
  selectionSet: SelectionSetNode;
  fragmentMap: FragmentMap;
  seenFragmentNames: Set<string>;
}): FieldNode[] =>
  selectionSet.selections.flatMap((selection) => {
    if (selection.kind === Kind.FIELD) {
      return [selection];
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      return collectFieldNodes({
        selectionSet: selection.selectionSet,
        fragmentMap,
        seenFragmentNames,
      });
    }

    const fragmentName = selection.name.value;
    const fragment = fragmentMap[fragmentName];

    if (!isDefined(fragment) || seenFragmentNames.has(fragmentName)) {
      return [];
    }

    return collectFieldNodes({
      selectionSet: fragment.selectionSet,
      fragmentMap,
      seenFragmentNames: new Set([...seenFragmentNames, fragmentName]),
    });
  });

const buildSchemaForSelectionSet = ({
  parentType,
  selectionSet,
  fragmentMap,
  depth,
}: {
  parentType: GraphQLNamedType;
  selectionSet: SelectionSetNode;
  fragmentMap: FragmentMap;
  depth: number;
}): OutputSchema => {
  if (
    !isObjectType(parentType) &&
    !isInterfaceType(parentType) &&
    !isUnionType(parentType)
  ) {
    return {};
  }

  // Union members share no fields, so only __typename could be resolved here.
  if (isUnionType(parentType)) {
    return {};
  }

  const fields = parentType.getFields();

  const fieldNodes = collectFieldNodes({
    selectionSet,
    fragmentMap,
    seenFragmentNames: new Set(),
  });

  return fieldNodes.reduce<OutputSchema>((outputSchema, fieldNode) => {
    const fieldName = fieldNode.name.value;
    const responseKey = fieldNode.alias?.value ?? fieldName;

    if (fieldName === '__typename') {
      return {
        ...outputSchema,
        [responseKey]: {
          isLeaf: true,
          type: 'string',
          label: responseKey,
          value: parentType.name,
        } satisfies Leaf,
      };
    }

    const fieldDefinition = fields[fieldName];

    if (!isDefined(fieldDefinition)) {
      return outputSchema;
    }

    const entry = buildSchemaForField({
      fieldType: fieldDefinition.type,
      fieldNode,
      label: responseKey,
      description: fieldDefinition.description ?? undefined,
      fragmentMap,
      depth,
    });

    if (!isDefined(entry)) {
      return outputSchema;
    }

    return { ...outputSchema, [responseKey]: entry };
  }, {});
};

const buildSchemaForField = ({
  fieldType,
  fieldNode,
  label,
  description,
  fragmentMap,
  depth,
}: {
  fieldType: GraphQLOutputType;
  fieldNode: FieldNode;
  label: string;
  description?: string;
  fragmentMap: FragmentMap;
  depth: number;
}): Leaf | Node | undefined => {
  const namedType = getNamedType(fieldType);
  const isList = isListTypeDeep(fieldType);

  if (isScalarType(namedType) || isEnumType(namedType)) {
    const leafType = getLeafTypeForNamedType(namedType);
    const sampleValue = getLeafSampleValue(namedType, leafType);

    return {
      isLeaf: true,
      type: isList ? 'array' : leafType,
      label,
      description,
      value: isList ? [sampleValue] : sampleValue,
    };
  }

  if (!isDefined(fieldNode.selectionSet) || depth >= MAX_SELECTION_DEPTH) {
    return undefined;
  }

  const nestedSchema = buildSchemaForSelectionSet({
    parentType: namedType,
    selectionSet: fieldNode.selectionSet,
    fragmentMap,
    depth: depth + 1,
  });

  if (Object.keys(nestedSchema).length === 0) {
    return undefined;
  }

  // A list of objects is described by the shape of a single item: downstream
  // steps iterate it, and the variable picker addresses items by index.
  return {
    isLeaf: false,
    type: isList ? 'array' : 'object',
    label,
    description,
    value: nestedSchema,
  };
};

const isListTypeDeep = (type: GraphQLOutputType): boolean => {
  if (isListType(type)) {
    return true;
  }

  if ('ofType' in type && isDefined(type.ofType)) {
    return isListTypeDeep(type.ofType as GraphQLOutputType);
  }

  return false;
};

export const getOperationDefinition = ({
  document,
  operationName,
}: {
  document: DocumentNode;
  operationName?: string;
}): OperationDefinitionNode | undefined => {
  const operations = document.definitions.filter(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION,
  );

  if (isDefined(operationName)) {
    return operations.find(
      (operation) => operation.name?.value === operationName,
    );
  }

  return operations.length === 1 ? operations[0] : undefined;
};

export const buildOutputSchemaFromGraphqlDocument = ({
  document,
  schema,
  operationName,
}: {
  document: DocumentNode;
  schema: GraphQLSchema;
  operationName?: string;
}): OutputSchema => {
  const operation = getOperationDefinition({ document, operationName });

  if (!isDefined(operation)) {
    return {};
  }

  const rootType =
    operation.operation === 'mutation'
      ? schema.getMutationType()
      : schema.getQueryType();

  if (!isDefined(rootType)) {
    return {};
  }

  return buildSchemaForSelectionSet({
    parentType: rootType,
    selectionSet: operation.selectionSet,
    fragmentMap: buildFragmentMap(document),
    depth: 0,
  });
};
