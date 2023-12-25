import type { GestureResponderEvent } from "react-native";

import { Stack, type StackProps, useTheme } from "tamagui";

import { StyledText, type StyledTextProps } from "../StyledText";

export type ListItemActionCoreProps = {
  content: string;
  contentStyle?: Omit<StyledTextProps, "children">;
  onClick: (event: GestureResponderEvent) => void;
  style?: Omit<StackProps, "children">;
};

export function ListItemActionCore({
  content,
  contentStyle,
  onClick,
  style,
}: ListItemActionCoreProps) {
  const theme = useTheme();
  return (
    <Stack {...style}>
      <StyledText
        color={theme.baseTextMedEmphasis.val}
        fontSize={14}
        onPress={onClick}
        pointerEvents="box-only"
        {...contentStyle}
      >
        {content}
      </StyledText>
    </Stack>
  );
}
