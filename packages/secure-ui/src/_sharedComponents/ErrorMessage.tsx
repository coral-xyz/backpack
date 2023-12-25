import type { ReactNode } from "react";

import { BanIcon, Stack, StyledText, useTheme } from "@coral-xyz/tamagui";

export function ErrorMessage({
  icon = (iconProps) => <BanIcon {...iconProps} />,
  title,
  body,
}: {
  icon?: (props: { size: number; color: any }) => ReactNode;
  title: ReactNode;
  body: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Stack flex={1} justifyContent="center" alignItems="center">
      <Stack
        overflow="hidden"
        borderWidth="$1"
        borderColor="$baseBorderLight"
        borderRadius="$container"
        backgroundColor="$baseBackgroundL1"
        space="$4"
        margin="$4"
        padding="$4"
      >
        {icon ? (
          <Stack alignItems="center">
            {icon({ size: 60, color: theme.baseTextMedEmphasis.val })}
          </Stack>
        ) : null}
        <Stack space="$2">
          <StyledText fontSize="$3xl" fontWeight="$bold" lineHeight="$3xl">
            {title}
          </StyledText>
          <StyledText
            fontSize="$sm"
            fontWeight="$medium"
            lineHeight="$sm"
            color="$baseTextMedEmphasis"
          >
            {body}
          </StyledText>
        </Stack>
      </Stack>
    </Stack>
  );
}
