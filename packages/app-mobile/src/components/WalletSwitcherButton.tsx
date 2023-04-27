import { Text, View, Pressable } from "react-native";

import { useActiveWallet } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { StyledText } from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function WalletSwitcherButton(): JSX.Element {
  const theme = useTheme();
  const activeWallet = useActiveWallet();
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("wallet-picker");
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 22,
        borderRadius: 32,
        borderWidth: 2,
        backgroundColor: theme.custom.colors.nav,
        borderColor: theme.custom.colors.borderFull,
        alignItems: "center",
      }}
    >
      <StyledText fontSize="$base" color="$fontColor">
        {activeWallet.name}
      </StyledText>
      <MaterialIcons
        name="keyboard-arrow-down"
        size={24}
        color={theme.custom.colors.fontColor}
        style={{ marginLeft: 4 }}
      />
    </Pressable>
  );
}
