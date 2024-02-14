import { useTranslation } from "@coral-xyz/i18n";
import {
  BarChart4Icon,
  ListItemCore,
  Loader,
  RoundedContainerGroup,
  StyledText,
  useTheme,
  View,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

export const StakeButtonComponent = ({
  subtitle,
  total,
  totalRewards,
  onPress,
}: {
  subtitle?: string;
  total?: string;
  totalRewards?: string;
  onPress?: () => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <RoundedContainerGroup disableBottomRadius={false} disableTopRadius={false}>
      <ListItemCore
        style={{
          backgroundColor: "$baseBackgroundL1",
          cursor: onPress ? "pointer" : "default",
          // @ts-ignore
          hoverTheme: Boolean(onPress),
        }}
        icon={
          <View
            borderRadius={44}
            width={44}
            height={44}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$darkGreenBackgroundTransparent"
          >
            {totalRewards === undefined ? (
              <Loader size={22} color={theme.greenText.val} />
            ) : (
              <BarChart4Icon size={22} color="$greenText" />
            )}
          </View>
        }
        onPress={onPress}
      >
        <YStack flex={1}>
          <XStack flex={1} alignItems="center" justifyContent="space-between">
            <StyledText fontSize="$base">{t("staking")}</StyledText>
            <StyledText flex={0} fontSize="$base">
              {total}
            </StyledText>
          </XStack>
          <XStack flex={1} alignItems="center" justifyContent="space-between">
            <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
              {subtitle || t("searching_dots")}
            </StyledText>
            <StyledText color="$greenText" flex={0} fontSize="$sm">
              {totalRewards}
            </StyledText>
          </XStack>
        </YStack>
      </ListItemCore>
    </RoundedContainerGroup>
  );
};
