import {
  AlertOctagonIcon,
  Image,
  BanIcon,
  LinkButton,
  AlertTriangleIcon,
  InfoIcon,
  Stack,
  XStack,
  StyledText,
  YStack,
  Separator,
  Square,
  UserAvatar,
} from "@coral-xyz/tamagui";

import { BlowfishCrossChainResult } from "./BlowfishEvaluation";

export function Warning({
  warning,
}: {
  warning: BlowfishCrossChainResult["warnings"][number];
}) {
  return (
    <YStack
      backgroundColor={
        warning.severity === "CRITICAL"
          ? "$redBackgroundTransparent"
          : "$yellowBackgroundTransparent"
      }
      borderRadius="$4"
      padding="$4"
      space="$4"
    >
      <Stack alignItems="center">
        {warning.severity === "CRITICAL" ? (
          <AlertOctagonIcon size={32} color="$redIcon" />
        ) : (
          <AlertTriangleIcon size={32} color="$yellowIcon" />
        )}
      </Stack>
      <StyledText
        textAlign="center"
        color={warning.severity === "CRITICAL" ? "$redText" : "$yellowText"}
      >
        {warning.message}
      </StyledText>
    </YStack>
  );
}
