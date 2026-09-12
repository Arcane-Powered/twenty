import { Module } from '@nestjs/common';

import { DirectExecutionModule } from 'src/engine/api/graphql/direct-execution/direct-execution.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { QueryWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/query/query.workflow-action';
import { WorkflowRunModule } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.module';

@Module({
  imports: [
    DirectExecutionModule,
    ApplicationModule,
    UserWorkspaceModule,
    UserRoleModule,
    RoleModule,
    WorkflowRunModule,
  ],
  providers: [WorkflowExecutionContextService, QueryWorkflowAction],
  exports: [QueryWorkflowAction],
})
export class QueryActionModule {}
