import { useState } from "react";
import { Pressable } from "react-native";

import { useActiveWallet } from "@coral-xyz/recoil";
import { StyledText, useTheme as useTamaguiTheme } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { BottomSheetWalletPicker } from "~components/BottomSheetWalletPicker";

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
          flexDirection: "row",
          paddingVertical: 8,
          paddingHorizontal: 22,
          borderRadius: 32,
          borderWidth: 2,
          backgroundColor: theme.nav.val,
          borderColor: theme.borderFull.val,
          alignItems: "center",
        }}
      >
        <StyledText fontSize="$base" color="$fontColor">
          {activeWallet.name}
        </StyledText>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color={theme.fontColor.val}
          style={{ marginLeft: 4 }}
        />
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
