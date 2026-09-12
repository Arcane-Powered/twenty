import {
  parseWorkflowQueryDocument,
  WorkflowQueryDocumentError,
} from 'src/modules/workflow/workflow-executor/workflow-actions/query/utils/parse-workflow-query-document.util';

describe('parseWorkflowQueryDocument', () => {
  it('returns the operation kind and name of a named query', () => {
    const parsed = parseWorkflowQueryDocument(`
      query FindCompanies {
        companies {
          totalCount
        }
      }
    `);

    expect(parsed.operation).toBe('query');
    expect(parsed.operationName).toBe('FindCompanies');
  });

  it('leaves the operation name undefined for an anonymous operation', () => {
    const parsed = parseWorkflowQueryDocument(`
      {
        companies {
          totalCount
        }
      }
    `);

    expect(parsed.operation).toBe('query');
    expect(parsed.operationName).toBeUndefined();
  });

  it('accepts a mutation', () => {
    const parsed = parseWorkflowQueryDocument(`
      mutation CreateCompany {
        createCompany(data: { name: "Acme" }) {
          id
        }
      }
    `);

    expect(parsed.operation).toBe('mutation');
  });

  it('rejects an empty query', () => {
    expect(() => parseWorkflowQueryDocument('   ')).toThrow(
      WorkflowQueryDocumentError,
    );
  });

  it('rejects a query that does not parse', () => {
    expect(() => parseWorkflowQueryDocument('query { companies')).toThrow(
      /could not be parsed/,
    );
  });

  it('rejects a document holding several operations', () => {
    expect(() =>
      parseWorkflowQueryDocument(`
        query One {
          companies {
            totalCount
          }
        }

        query Two {
          companies {
            totalCount
          }
        }
      `),
    ).toThrow(/exactly one operation, found 2/);
  });

  it('rejects a document with no operation', () => {
    expect(() =>
      parseWorkflowQueryDocument(`
        fragment CompanyFields on Company {
          id
        }
      `),
    ).toThrow(/found none/);
  });

  it('rejects a subscription', () => {
    expect(() =>
      parseWorkflowQueryDocument(`
        subscription OnCompany {
          companyCreated {
            id
          }
        }
      `),
    ).toThrow(/Subscriptions are not supported/);
  });
});
