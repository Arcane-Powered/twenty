import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';
import { type PersistSentMessageInput } from 'src/modules/messaging/message-outbound-manager/types/persist-sent-message-input.type';

const MESSAGE_EXTERNAL_ID = 'provider-message-id';

const buildInput = (
  overrides: Partial<PersistSentMessageInput> = {},
): PersistSentMessageInput =>
  ({
    sendResult: {
      headerMessageId: '<sent@mail.example>',
      messageExternalId: MESSAGE_EXTERNAL_ID,
      threadExternalId: 'provider-thread-id',
    },
    subject: 'Quarterly review',
    body: 'See attached.',
    recipients: { to: ['alice@example.com'], cc: [], bcc: [] },
    connectedAccount: { id: 'account-1', handle: 'sender@example.com' },
    messageChannelId: 'channel-1',
    workspaceId: 'workspace-1',
    ...overrides,
  }) as PersistSentMessageInput;

describe('SentMessagePersistenceService', () => {
  let service: SentMessagePersistenceService;
  let mockCopyFileIntoFilesField: jest.Mock;
  let mockFindFieldMetadata: jest.Mock;
  let mockSaveMessages: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCopyFileIntoFilesField = jest.fn();
    mockFindFieldMetadata = jest.fn().mockResolvedValue({ id: 'field-1' });
    mockSaveMessages = jest.fn().mockResolvedValue({
      messageExternalIdsAndIdsMap: new Map([
        [MESSAGE_EXTERNAL_ID, 'message-1'],
      ]),
      messageExternalIdToMessageThreadIdMap: new Map([
        [MESSAGE_EXTERNAL_ID, 'thread-1'],
      ]),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SentMessagePersistenceService,
        {
          provide: getRepositoryToken(MessageChannelEntity),
          useValue: {
            findOneOrFail: jest
              .fn()
              .mockResolvedValue({ id: 'channel-1', connectedAccount: {} }),
          },
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity),
          useValue: { findOne: mockFindFieldMetadata },
        },
        {
          provide: FilesFieldService,
          useValue: { copyFileIntoFilesField: mockCopyFileIntoFilesField },
        },
        {
          provide: MessagingSaveMessagesAndEnqueueContactCreationService,
          useValue: {
            saveMessagesAndEnqueueContactCreation: mockSaveMessages,
          },
        },
      ],
    }).compile();

    service = module.get(SentMessagePersistenceService);
  });

  it('should copy the sent attachments into the message files field', async () => {
    mockCopyFileIntoFilesField.mockResolvedValue({ id: 'copied-file-1' });

    await service.persistSentMessage(
      buildInput({ files: [{ id: 'upload-1', name: 'contract.pdf' }] }),
    );

    expect(mockCopyFileIntoFilesField).toHaveBeenCalledWith({
      fileId: 'upload-1',
      workspaceId: 'workspace-1',
      fieldMetadataId: 'field-1',
    });
    expect(mockSaveMessages.mock.calls[0][0][0].files).toEqual([
      { fileId: 'copied-file-1', label: 'contract.pdf' },
    ]);
  });

  it('should persist the message without files when an attachment copy fails', async () => {
    mockCopyFileIntoFilesField.mockRejectedValue(new Error('storage down'));

    const result = await service.persistSentMessage(
      buildInput({ files: [{ id: 'upload-1', name: 'contract.pdf' }] }),
    );

    expect(result).toEqual({
      messageId: 'message-1',
      messageThreadId: 'thread-1',
    });
    expect(mockSaveMessages.mock.calls[0][0][0].files).toBeUndefined();
  });

  it('should not look up the files field when the message has no attachment', async () => {
    await service.persistSentMessage(buildInput());

    expect(mockFindFieldMetadata).not.toHaveBeenCalled();
    expect(mockCopyFileIntoFilesField).not.toHaveBeenCalled();
  });
});
