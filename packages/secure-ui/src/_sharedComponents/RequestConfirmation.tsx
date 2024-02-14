import type { ReactNode } from "react";

import { useTranslation } from "@coral-xyz/i18n";
import {
  CustomScrollView,
  PrimaryButton,
  SecondaryButton,
  Stack,
  StackProps,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

export function RequestConfirmation({
  onDeny,
  onApprove,
  leftButton,
  rightButton,
  title,
  children,
  buttonDirection = "row",
  ...styles
}: {
  onDeny?: () => void;
  onApprove?: () => void;
  leftButton?: ReactNode;
  rightButton?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  buttonDirection?:
    | 'row'
    | 'column'
    | 'row-reverse'
    | 'column-reverse';
} & StackProps) {
  const { t } = useTranslation();

  leftButton = leftButton === undefined ? t("deny") : leftButton;
  rightButton = rightButton === undefined ? t("approve") : rightButton;

  return (
    <Stack flex={1} {...styles}>
      {title !== undefined ? (
        <Stack padding="$4" paddingBottom="$2">
          {typeof title === "string" ? (
            <StyledText
              // fontSize="$lg"
              fontWeight="$semiBold"
              textAlign="center"
              color="$baseTextHighEmphasis"
            >
              {title}
            </StyledText>
          ) : (
            title
          )}
        </Stack>
      ) : null}
      <Stack flex={1} position="relative">
        <CustomScrollView style={{ flex: 1 }}>
          <Stack
            position="relative"
            f={1}
            paddingHorizontal="$4"
            paddingVertical="$4"
            space="$4"
          >
            {children ?? null}
          </Stack>
        </CustomScrollView>
      </Stack>
      {buttonDirection.startsWith("column") ? (
        <YStack padding="$4" paddingTop="$2" space="$4" flexDirection={buttonDirection}>
          {leftButton ? (
            <Stack>
              {typeof leftButton === "string" && onDeny ? (
                <SecondaryButton label={leftButton} onPress={onDeny} />
              ) : (
                leftButton
              )}
            </Stack>
          ) : null}
          {rightButton ? (
            <Stack>
              {typeof rightButton === "string" && onApprove ? (
                <PrimaryButton label={rightButton} onPress={onApprove} />
              ) : (
                rightButton
              )}
            </Stack>
          ) : null}
        </YStack>
      ) : (
        <XStack padding="$4" paddingTop="$2" space="$4" flexDirection={buttonDirection}>
          {leftButton ? (
            <Stack flex={1} flexShrink={1} flexBasis={0} pointerEvents="auto">
              {typeof leftButton === "string" && onDeny ? (
                <SecondaryButton label={leftButton} onPress={onDeny} />
              ) : (
                leftButton
              )}
            </Stack>
          ) : null}
          {rightButton ? (
            <Stack flex={1} flexShrink={1} flexBasis={0} pointerEvents="auto">
              {typeof rightButton === "string" && onApprove ? (
                <PrimaryButton label={rightButton} onPress={onApprove} />
              ) : (
                rightButton
              )}
            </Stack>
          ) : null}
        </XStack>
      )}
    </Stack>
  );
}
