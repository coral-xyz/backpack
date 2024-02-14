import { useTranslation } from "@coral-xyz/i18n";
import {
  LinkButton,
  Settings2Icon,
  type StackProps,
  StyledText,
  View,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

export function ShowUnverifiedToggle({
  show,
  style,
  toggleShow,
}: {
  show: boolean;
  style?: StackProps;
  toggleShow: () => void;
}) {
  const { t } = useTranslation();
  return (
    <XStack f={1} alignItems="center" px={4} {...style}>
      <View flex={1} />
      <LinkButton
        onPress={toggleShow}
        label={
          <XStack gap="$2">
            <Settings2Icon size={24} color="$baseTextMedEmphasis" />
            <YStack jc="center">
              <StyledText color="$baseTextMedEmphasis" fontWeight="$semiBold">
                {show
                  ? t("collections_filter.hide")
                  : t("collections_filter.show")}
              </StyledText>
            </YStack>
          </XStack>
        }
      />
      <View flex={1} />
    </XStack>
  );
}
