import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { View } from "react-native";
import { walletAddressDisplay } from "@coral-xyz/common";
import { Margin, Stack, Text } from "@coral-xyz/tamagui";

import { useTheme } from "../hooks/index";

export function WalletAddressLabel({
  publicKey,
  name,
  style,
  nameStyle,
}: {
  publicKey: string;
  name: string;
  style: StyleProp<ViewStyle>;
  nameStyle: StyleProp<TextStyle>;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>
      <Margin right={8}>
        <Text style={[{ color: theme.custom.colors.fontColor }, nameStyle]}>
          {name}
        </Text>
      </Margin>
      <Text style={{ color: theme.custom.colors.secondary }}>
        ({walletAddressDisplay(publicKey)})
      </Text>
    </View>
  );
}

export function Pill() {
  return (
    <Stack
      paddingHorizontal={12}
      paddingVertical={4}
      alignSelf="center"
      backgroundColor="$nav"
      borderRadius={16}
    >
      <Text>0xkjdk...sdfkj</Text>
    </Stack>
  );
}
