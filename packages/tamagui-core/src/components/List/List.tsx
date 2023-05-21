import type { ReactNode } from "react";
import type { ViewStyleWithPseudos } from "@tamagui/core";
import { Separator, YGroup, YStack } from "tamagui";

import { useCustomTheme } from "../../hooks";
import { StyledText } from "../StyledText";

export type ListCoreProps = {
  children: ReactNode;
  heading?: string;
  style?: ViewStyleWithPseudos;
};

export function ListCore({ children, heading, style }: ListCoreProps) {
  const theme = useCustomTheme();
  return (
    <YStack gap={8} marginHorizontal={18} {...style}>
      {heading ? <StyledText
        color={theme.custom.colors.smallTextColor}
        fontSize={14}
        marginLeft={4}
        >
        {heading}
      </StyledText> : null}
      <YGroup
        disablePassBorderRadius
        borderColor={theme.custom.colors.border}
        borderRadius={12}
        borderWidth={2}
        paddingVertical={0}
        separator={<Separator borderColor={theme.custom.colors.border} />}
      >
        {children}
      </YGroup>
    </YStack>
  );
}
