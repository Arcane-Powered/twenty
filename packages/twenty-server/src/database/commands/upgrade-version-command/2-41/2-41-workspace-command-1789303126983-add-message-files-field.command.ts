import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE = STANDARD_OBJECTS.message;

const FILES_FIELD_UNIVERSAL_IDENTIFIER =
  MESSAGE.fields.files.universalIdentifier;

@RegisteredWorkspaceCommand('2.41.0', 1789303126983)
@Command({
  name: 'upgrade:2-41:add-message-files-field',
  description:
    'Add the files field to message so attachments sent from Twenty stay readable in the thread',
})
export class AddMessageFilesFieldCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const messageObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: MESSAGE.universalIdentifier,
      });

    if (!isDefined(messageObjectMetadata)) {
      this.logger.log(
        `message object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (
      isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          FILES_FIELD_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      this.logger.log(
        `message files field already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardFilesField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier: FILES_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(standardFilesField)) {
      throw new Error('Standard application is missing the message files field');
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would add the message files field`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [standardFilesField],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add the message files field:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add the message files field for workspace ${workspaceId}`,
      );
    }

    this.logger.log(`Added the message files field for workspace ${workspaceId}`);
  }
}
