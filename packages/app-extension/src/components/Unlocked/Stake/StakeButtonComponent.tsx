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
  subtitle = "Searching...",
  total,
  totalRewards,
  handleClick,
}: {
  subtitle?: string;
  total?: string;
  totalRewards?: string;
  handleClick?: () => void;
}) => {
  const theme = useTheme();
  return (
    <YStack marginHorizontal={16} marginTop={16}>
      <RoundedContainerGroup
        disableBottomRadius={false}
        disableTopRadius={false}
      >
        <ListItemCore
          style={{
            backgroundColor: "$baseBackgroundL1",
            cursor: handleClick ? "pointer" : "default",
            hoverTheme: Boolean(handleClick),
          }}
          icon={
            <View
              borderRadius={44}
              backgroundColor="$darkGreenBackgroundTransparent"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                width: 44,
              }}
            >
              {totalRewards === undefined ? (
                <Loader size={22} color={theme.greenText.val} />
              ) : (
                <BarChart4Icon size={22} color="$greenText" />
              )}
            </View>
          }
          onClick={() => handleClick?.()}
        >
          <YStack display="flex" flex={1}>
            <XStack
              display="flex"
              flex={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <StyledText fontSize="$base">Staking</StyledText>
              <StyledText flex={0} fontSize="$base">
                {total}
              </StyledText>
            </XStack>
            <XStack
              display="flex"
              flex={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
                {subtitle}
              </StyledText>
              <StyledText color="$greenText" flex={0} fontSize="$sm">
                {totalRewards}
              </StyledText>
            </XStack>
          </YStack>
        </ListItemCore>
      </RoundedContainerGroup>
    </YStack>
  );
};
