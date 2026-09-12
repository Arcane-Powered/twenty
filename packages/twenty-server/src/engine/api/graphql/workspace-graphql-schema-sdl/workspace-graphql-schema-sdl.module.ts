import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceSchemaBuilderModule } from 'src/engine/api/graphql/workspace-schema-builder/workspace-schema-builder.module';
import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { WorkspaceGraphqlTypeSchemaService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-type-schema.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    WorkspaceSchemaBuilderModule,
    WorkspaceCacheStorageModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [
    WorkspaceGraphqlSchemaSDLService,
    WorkspaceGraphqlTypeSchemaService,
    ScalarsExplorerService,
  ],
  exports: [
    WorkspaceGraphqlSchemaSDLService,
    WorkspaceGraphqlTypeSchemaService,
  ],
})
export class WorkspaceGraphqlSchemaSDLModule {}
