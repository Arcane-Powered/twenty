import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledThreadMessage = styled.div<{
  hideBottomBorder?: boolean;
  isRowClickable?: boolean;
}>`
  border-bottom: ${({ hideBottomBorder }) =>
    hideBottomBorder
      ? 'none'
      : `1px solid ${themeCssVariables.border.color.light}`};
  cursor: ${({ isRowClickable }) => (isRowClickable ? 'pointer' : 'auto')};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
  position: relative;
  transition: ${themeCssVariables.clickableElementBackgroundTransition};

  &:hover {
    background: ${({ isRowClickable }) =>
      isRowClickable
        ? themeCssVariables.background.transparent.lighter
        : 'none'};
  }
`;

const StyledHeader = styled.div<{ isClickable?: boolean }>`
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'auto')};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledBody = styled.div`
  padding-top: ${themeCssVariables.spacing[1]};
`;

// Actions sit above the row so they never reflow the header when they appear.
const StyledActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  opacity: 0;
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;

  ${StyledThreadMessage}:hover & {
    opacity: 1;
  }

  &:focus-within {
    opacity: 1;
  }
`;

type EmailThreadMessageLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  hideBottomBorder?: boolean;
  isRowClickable?: boolean;
  isHeaderClickable?: boolean;
  onRowClick?: () => void;
  onHeaderClick?: () => void;
};

export const EmailThreadMessageLayout = ({
  header,
  children,
  actions,
  hideBottomBorder = false,
  isRowClickable = false,
  isHeaderClickable = false,
  onRowClick,
  onHeaderClick,
}: EmailThreadMessageLayoutProps) => (
  <StyledThreadMessage
    hideBottomBorder={hideBottomBorder}
    isRowClickable={isRowClickable}
    onClick={onRowClick}
  >
    <StyledHeader isClickable={isHeaderClickable} onClick={onHeaderClick}>
      {header}
    </StyledHeader>
    <StyledBody>{children}</StyledBody>
    {isDefined(actions) && <StyledActions>{actions}</StyledActions>}
  </StyledThreadMessage>
);
