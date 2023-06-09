import { Stack, type StackProps } from "tamagui";

import { useCustomTheme } from "../../hooks";
import { StyledText, type StyledTextProps } from "../StyledText";

export type ListItemActionCoreProps = {
  content: string;
  contentStyle?: Omit<StyledTextProps, "children">;
  onClick: (event: any) => void;
  style?: Omit<StackProps, "children">;
};

export function ListItemActionCore({
  content,
  contentStyle,
  onClick,
  style,
}: ListItemActionCoreProps) {
  const theme = useCustomTheme();
  return (
    <Stack {...style}>
      <StyledText
        color={theme.custom.colors.textPlaceholder}
        fontSize={14}
        onPress={onClick}
        {...contentStyle}
      >
        {content}
      </StyledText>
    </Stack>
  );
}
