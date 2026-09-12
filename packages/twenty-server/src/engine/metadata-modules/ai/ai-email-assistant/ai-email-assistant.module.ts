import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { AiBillingModule } from 'src/engine/metadata-modules/ai/ai-billing/ai-billing.module';
import { AiEmailAssistantResolver } from 'src/engine/metadata-modules/ai/ai-email-assistant/resolvers/ai-email-assistant.resolver';
import { AiEmailAssistantService } from 'src/engine/metadata-modules/ai/ai-email-assistant/services/ai-email-assistant.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [PermissionsModule, BillingModule, AiBillingModule],
  providers: [AiEmailAssistantResolver, AiEmailAssistantService],
})
export class AiEmailAssistantModule {}
