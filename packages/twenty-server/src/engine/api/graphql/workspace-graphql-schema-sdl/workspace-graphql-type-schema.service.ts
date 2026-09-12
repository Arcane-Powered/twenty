import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buildSchema, type GraphQLSchema } from 'graphql';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';

// Type-only view of a workspace's GraphQL schema: built from the cached SDL and
// carrying no resolvers, for callers that need to reason about the shape of a
// document (validation, output schema derivation) rather than execute it.
@Injectable()
export class WorkspaceGraphqlTypeSchemaService {
  constructor(
    private readonly workspaceGraphqlSchemaSDLService: WorkspaceGraphqlSchemaSDLService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getTypeSchema({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId?: string;
  }): Promise<GraphQLSchema | undefined> {
    const workspaceEntity = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspaceEntity)) {
      return undefined;
    }

    const schemaSDLResult =
      await this.workspaceGraphqlSchemaSDLService.getOrComputeSchemaSDL(
        fromWorkspaceEntityToFlat(workspaceEntity),
        applicationId,
      );

    if (!isDefined(schemaSDLResult)) {
      return undefined;
    }

    return buildSchema(schemaSDLResult.sdl);
  }
}
