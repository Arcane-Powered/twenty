import { buildSchema, parse } from 'graphql';

import { buildOutputSchemaFromGraphqlDocument } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/build-output-schema-from-graphql-document.util';

const schema = buildSchema(`
  scalar UUID
  scalar DateTime

  enum OpportunityStage {
    NEW
    SCREENING
    WON
  }

  type FullName {
    firstName: String
    lastName: String
  }

  type Person {
    id: UUID!
    name: FullName
    createdAt: DateTime
    company: Company
  }

  type PersonEdge {
    node: Person!
    cursor: String
  }

  type PersonConnection {
    edges: [PersonEdge!]!
    totalCount: Int!
  }

  type Company {
    id: UUID!
    name: String
    employees: Int
    stage: OpportunityStage
    people: PersonConnection
  }

  type CompanyEdge {
    node: Company!
  }

  type CompanyConnection {
    edges: [CompanyEdge!]!
    totalCount: Int!
  }

  type Query {
    companies: CompanyConnection
    company(id: UUID!): Company
  }

  type Mutation {
    createCompany(name: String!): Company
  }
`);

const buildFrom = (query: string, operationName?: string) =>
  buildOutputSchemaFromGraphqlDocument({
    document: parse(query),
    schema,
    operationName,
  });

describe('buildOutputSchemaFromGraphqlDocument', () => {
  it('describes scalar selections as typed leaves', () => {
    const outputSchema = buildFrom(`
      query {
        company(id: "x") {
          id
          name
          employees
        }
      }
    `);

    expect(outputSchema).toMatchObject({
      company: {
        isLeaf: false,
        type: 'object',
        value: {
          id: { isLeaf: true, type: 'string' },
          name: { isLeaf: true, type: 'string' },
          employees: { isLeaf: true, type: 'number' },
        },
      },
    });
  });

  it('describes an enum field as a string leaf sampled from the schema', () => {
    const outputSchema = buildFrom(`
      query {
        company(id: "x") {
          stage
        }
      }
    `);

    expect(outputSchema).toMatchObject({
      company: {
        value: {
          stage: { isLeaf: true, type: 'string', value: 'NEW' },
        },
      },
    });
  });

  it('describes a list of objects by the shape of one item', () => {
    const outputSchema = buildFrom(`
      query {
        companies {
          edges {
            node {
              name
            }
          }
          totalCount
        }
      }
    `);

    expect(outputSchema).toMatchObject({
      companies: {
        isLeaf: false,
        type: 'object',
        value: {
          edges: {
            isLeaf: false,
            type: 'array',
            value: {
              node: {
                isLeaf: false,
                type: 'object',
                value: { name: { isLeaf: true, type: 'string' } },
              },
            },
          },
          totalCount: { isLeaf: true, type: 'number' },
        },
      },
    });
  });

  it('keys entries by alias when one is used', () => {
    const outputSchema = buildFrom(`
      query {
        acme: company(id: "x") {
          companyName: name
        }
      }
    `);

    expect(Object.keys(outputSchema)).toEqual(['acme']);
    expect(outputSchema).toMatchObject({
      acme: { label: 'acme', value: { companyName: { label: 'companyName' } } },
    });
  });

  it('resolves fields brought in by named and inline fragments', () => {
    const outputSchema = buildFrom(`
      query {
        company(id: "x") {
          ...CompanyFields
          ... on Company {
            employees
          }
        }
      }

      fragment CompanyFields on Company {
        id
        name
      }
    `);

    expect(
      Object.keys((outputSchema as Record<string, any>).company.value),
    ).toEqual(['id', 'name', 'employees']);
  });

  it('walks the mutation root for a mutation operation', () => {
    const outputSchema = buildFrom(`
      mutation {
        createCompany(name: "Acme") {
          id
        }
      }
    `);

    expect(outputSchema).toMatchObject({
      createCompany: { value: { id: { isLeaf: true, type: 'string' } } },
    });
  });

  it('selects the named operation when the document holds several', () => {
    const document = `
      query One {
        company(id: "x") {
          id
        }
      }

      query Two {
        companies {
          totalCount
        }
      }
    `;

    expect(Object.keys(buildFrom(document, 'Two'))).toEqual(['companies']);
    expect(buildFrom(document)).toEqual({});
  });

  it('ignores fields the schema does not define', () => {
    const outputSchema = buildFrom(`
      query {
        company(id: "x") {
          id
          notAField
        }
      }
    `);

    expect(
      Object.keys((outputSchema as Record<string, any>).company.value),
    ).toEqual(['id']);
  });

  it('drops object fields selected without a selection set', () => {
    const outputSchema = buildFrom(`
      query {
        company(id: "x") {
          id
          __typename
        }
      }
    `);

    expect(outputSchema).toMatchObject({
      company: {
        value: {
          id: { isLeaf: true },
          __typename: { isLeaf: true, type: 'string', value: 'Company' },
        },
      },
    });
  });

  it('returns an empty schema when the document has no operation', () => {
    expect(
      buildFrom(`
        fragment CompanyFields on Company {
          id
        }
      `),
    ).toEqual({});
  });
});
