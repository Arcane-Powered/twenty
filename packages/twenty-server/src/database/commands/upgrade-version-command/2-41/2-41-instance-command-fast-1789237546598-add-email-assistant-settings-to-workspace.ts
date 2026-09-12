import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789237546598)
export class AddEmailAssistantSettingsToWorkspaceFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiEmailInstructions" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiEmailTone" character varying NOT NULL DEFAULT 'professional'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiEmailLanguage" character varying NOT NULL DEFAULT 'auto'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiEmailLength" character varying NOT NULL DEFAULT 'concise'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isAiEmailAutoSummaryEnabled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isAiEmailAutoSummaryEnabled", DROP COLUMN "aiEmailLength", DROP COLUMN "aiEmailLanguage", DROP COLUMN "aiEmailTone", DROP COLUMN "aiEmailInstructions"`,
    );
  }
}
