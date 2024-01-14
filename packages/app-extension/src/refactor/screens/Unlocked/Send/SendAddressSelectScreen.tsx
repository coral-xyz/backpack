import { useTheme, XStack, YStack } from "@coral-xyz/tamagui";
import { Skeleton } from "@mui/material";

import { AddressSelector } from "../../../../components/Unlocked/Balances/TokensWidget/AddressSelector";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type SendAddressSelectScreenProps,
} from "../../../navigation/SendNavigator";

export function SendAddressSelectScreen(props: SendAddressSelectScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Container({
  navigation,
  route: {
    params: { assetId, blockchain },
  },
}: SendAddressSelectScreenProps) {
  return (
    <AddressSelector
      blockchain={blockchain}
      onSelect={(sendData) => {
        navigation.push(Routes.SendAmountSelectScreen, {
          assetId,
          blockchain,
          to: sendData,
        });
      }}
    />
  );
}

export function Loading() {
  const theme = useTheme();
  return (
    <YStack
      height="100%"
      space="$3"
      style={{ paddingLeft: 18, paddingRight: 18 }}
    >
      <XStack jc="center">
        <Skeleton
          height={46}
          width={339}
          style={{
            backgroundColor: theme.baseBackgroundL1.val,
            borderRadius: 8,
          }}
        />
      </XStack>
      <YStack>
        <Skeleton
          height={26}
          width={52}
          style={{
            backgroundColor: theme.baseBackgroundL1.val,
            borderRadius: 8,
          }}
        />
        <YStack space="$1">
          <Skeleton
            height={26}
            width="100%"
            style={{
              backgroundColor: theme.baseBackgroundL1.val,
              borderRadius: 8,
            }}
          />
          <Skeleton
            height={26}
            width="100%"
            style={{
              backgroundColor: theme.baseBackgroundL1.val,
              borderRadius: 8,
            }}
          />
          <Skeleton
            height={26}
            width="100%"
            style={{
              backgroundColor: theme.baseBackgroundL1.val,
              borderRadius: 8,
            }}
          />
          <Skeleton
            height={26}
            width="100%"
            style={{
              backgroundColor: theme.baseBackgroundL1.val,
              borderRadius: 8,
            }}
          />
        </YStack>
      </YStack>
    </YStack>
  );
}
