import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { gql } from '@apollo/client';
import {
  buildClientSchema,
  getIntrospectionQuery,
  type GraphQLSchema,
  type IntrospectionQuery,
} from 'graphql';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const INTROSPECTION_QUERY = gql`
  ${getIntrospectionQuery()}
`;

// The workspace schema is per workspace and changes whenever objects or fields
// change, so it is introspected at mount rather than generated at build time.
export const useWorkspaceGraphqlSchema = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [schema, setSchema] = useState<GraphQLSchema | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isStale = false;

    const loadSchema = async () => {
      try {
        const { data } = await apolloCoreClient.query<IntrospectionQuery>({
          query: INTROSPECTION_QUERY,
          fetchPolicy: 'cache-first',
        });

        if (isStale || !isDefined(data)) {
          return;
        }

        setSchema(buildClientSchema(data));
      } catch {
        if (!isStale) {
          setSchema(undefined);
        }
      } finally {
        if (!isStale) {
          setIsLoading(false);
        }
      }
    };

    loadSchema();

    return () => {
      isStale = true;
    };
  }, [apolloCoreClient]);

  return { schema, isLoading };
};
