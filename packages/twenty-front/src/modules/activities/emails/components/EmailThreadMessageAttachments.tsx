import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FilesDisplay } from '@/ui/field/display/components/FilesDisplay';

type EmailThreadMessageAttachmentsProps = {
  files: FieldFilesValue[];
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const EmailThreadMessageAttachments = ({
  files,
}: EmailThreadMessageAttachmentsProps) => {
  if (!isNonEmptyArray(files)) {
    return null;
  }

  return (
    <StyledContainer onClick={(event) => event.stopPropagation()}>
      <FilesDisplay value={files} />
    </StyledContainer>
  );
};
