import { useState } from "react";
import { Pressable } from "react-native";

import {
  StyledText,
  XStack,
  useTheme as useTamaguiTheme,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { BottomSheetWalletPicker } from "~components/BottomSheetWalletPicker";
import { IconDropdown } from "~components/Icon";
import { BlockchainLogo } from "~components/index";

import { useSession } from "~src/lib/SessionProvider";

export function WalletSwitcherButton(): JSX.Element {
  const { activeWallet } = useSession();
  const navigation = useNavigation();
  const theme = useTamaguiTheme();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          setIsVisible(true);
        }}
        style={{
          borderRadius: 32,
          borderWidth: 1,
          backgroundColor: theme.nav.val,
          borderColor: theme.borderFull.val,

          shadowColor: "rgba(0, 0, 0, 1)",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.06,
          shadowRadius: 1,
          elevation: 2,
        }}
      >
        <XStack space={8} ai="center" py={8} pl={18} pr={12}>
          <BlockchainLogo blockchain={activeWallet!.blockchain} size={16} />
          <StyledText fontSize="$base" color="$baseTextMedEmphasis" mr={-6}>
            {activeWallet?.name}
          </StyledText>
          <IconDropdown size={22} color="#8E919F" />
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
