import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type FileInput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type PersistSentMessageInput } from 'src/modules/messaging/message-outbound-manager/types/persist-sent-message-input.type';
import { type PersistedSentMessage } from 'src/modules/messaging/message-outbound-manager/types/persisted-sent-message.type';
import { formatSentMessage } from 'src/modules/messaging/message-outbound-manager/utils/format-sent-message.util';

const MESSAGE_FILES_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.message.fields.files.universalIdentifier;

@Injectable()
export class SentMessagePersistenceService {
  private readonly logger = new Logger(SentMessagePersistenceService.name);

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly filesFieldService: FilesFieldService,
    private readonly saveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
  ) {}

  async persistSentMessage(
    input: PersistSentMessageInput,
  ): Promise<PersistedSentMessage | undefined> {
    const messageChannel = await this.messageChannelRepository.findOneOrFail({
      where: {
        id: input.messageChannelId,
        workspaceId: input.workspaceId,
      },
      relations: { connectedAccount: true },
    });

    const messageFiles = await this.copyAttachmentsIntoMessageFilesField(input);

    const messageToSave = formatSentMessage(input, messageFiles);

    const savedMessagesResult =
      await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
        [messageToSave],
        messageChannel,
        messageChannel.connectedAccount,
        input.workspaceId,
      );

    const messageId = savedMessagesResult?.messageExternalIdsAndIdsMap.get(
      messageToSave.externalId,
    );
    const messageThreadId =
      savedMessagesResult?.messageExternalIdToMessageThreadIdMap.get(
        messageToSave.externalId,
      );

    if (!isDefined(messageId) || !isDefined(messageThreadId)) {
      return undefined;
    }

    return { messageId, messageThreadId };
  }

  // The uploaded email attachments live in the ephemeral email-attachment
  // folder and are deleted right after the send, so they are copied into the
  // message files field to stay readable from the thread afterwards.
  private async copyAttachmentsIntoMessageFilesField({
    files,
    workspaceId,
  }: PersistSentMessageInput): Promise<FileInput[]> {
    if (!isNonEmptyArray(files)) {
      return [];
    }

    const filesFieldMetadata = await this.fieldMetadataRepository.findOne({
      select: ['id'],
      where: {
        universalIdentifier: MESSAGE_FILES_FIELD_UNIVERSAL_IDENTIFIER,
        workspaceId,
      },
    });

    if (!isDefined(filesFieldMetadata)) {
      this.logger.warn(
        `Workspace ${workspaceId} has no message files field, skipping sent attachments`,
      );

      return [];
    }

    const messageFiles: FileInput[] = [];

    for (const file of files) {
      try {
        const copiedFile = await this.filesFieldService.copyFileIntoFilesField({
          fileId: file.id,
          workspaceId,
          fieldMetadataId: filesFieldMetadata.id,
        });

        messageFiles.push({ fileId: copiedFile.id, label: file.name });
      } catch (error) {
        this.logger.warn(
          `Failed to keep the sent attachment ${file.id} of workspace ${workspaceId}: ${error}`,
        );
      }
    }

    return messageFiles;
  }
}
