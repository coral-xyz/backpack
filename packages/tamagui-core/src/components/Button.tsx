import {
  Image as RNImage,
  StyleSheet,
  Text as RNText,
  View as RNView,
} from "react-native";
import type { GetProps } from "tamagui";
import { Button, Stack, styled, Text } from "tamagui";

export const BaseButton = styled(Button, {
  theme: "dark",
  name: "BaseButton",
  borderRadius: 12,
  paddingHorizontal: 12,
  height: 48,
  userSelect: "none",
  backgroundColor: "$primaryButton",
  color: "$primaryButtonTextColor",
  fontWeight: "500",
  fontSize: 16,
});

export type BaseButtonProps = GetProps<typeof BaseButton>;

export function Button2() {
  return (
    <Stack backgroundColor="red">
      <Text>Hello world</Text>
      <RNText>Hi hi </RNText>
      <RNView style={{ height: 50, backgroundColor: "pink" }} />
    </Stack>
  );
}

export function Button3() {
  console.log("tamagui2 helllooooo", RNView, RNText);
  return (
    <RNView style={styles.c}>
      <RNText>Hello poppy</RNText>
    </RNView>
  );
}

const styles = StyleSheet.create({
  c: {
    height: 40,
    backgroundColor: "blue",
  },
});
