import { useState } from "react";
import { Pressable } from "react-native";

import { useActiveWallet } from "@coral-xyz/recoil";
import {
  StyledText,
  XStack,
  useTheme as useTamaguiTheme,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { BottomSheetWalletPicker } from "~components/BottomSheetWalletPicker";
import { IconDropdown } from "~components/Icon";

import { BlockchainLogo } from ".";

export function WalletSwitcherButton(): JSX.Element {
  const navigation = useNavigation();
  const theme = useTamaguiTheme();
  const activeWallet = useActiveWallet();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          setIsVisible(true);
        }}
        style={{
          borderRadius: 32,
          borderWidth: 2,
          backgroundColor: theme.nav.val,
          borderColor: theme.borderFull.val,
        }}
      >
        <XStack space={8} ai="center" py={8} px={18}>
          <BlockchainLogo blockchain={activeWallet.blockchain} size={16} />
          <StyledText fontSize="$base" color="$fontColor" mr={-6}>
            {activeWallet.name}
          </StyledText>
          <IconDropdown size={22} color="$fontColor" />
        </XStack>
      </Pressable>
      <BetterBottomSheet
        isVisible={isVisible}
        resetVisibility={() => {
          setIsVisible(false);
        }}
      >
        <BottomSheetWalletPicker navigation={navigation} />
      </BetterBottomSheet>
    </>
  );
}
