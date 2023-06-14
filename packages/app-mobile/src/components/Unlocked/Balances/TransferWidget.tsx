import { Pressable, Text, View } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import { XStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";

import { Margin } from "~components/index";
import { useTheme } from "~hooks/useTheme";

import { Token, NavTokenOptions } from "~types/types";

export function TransferWidget({
  address,
  blockchain,
  onPressOption,
  swapEnabled,
  token,
}: {
  address?: string;
  blockchain?: Blockchain;
  onPressOption: (route: string, options: NavTokenOptions) => void;
  rampEnabled: boolean;
  swapEnabled: boolean;
  token?: Token;
}): JSX.Element {
  return (
    <XStack space={10} ai="center" alignSelf="center" jc="center">
      <TransferButton
        label="Receive"
        icon="arrow-downward"
        onPress={() => onPressOption("DepositSingle", { blockchain })}
      />
      <TransferButton
        label="Send"
        icon="arrow-upward"
        onPress={() =>
          onPressOption("SendSelectTokenModal", {
            title: "TODO",
            blockchain,
            token: token
              ? { ...token, nativeBalance: token.nativeBalance.toString() }
              : null,
          })
        }
      />
      {swapEnabled ? (
        <TransferButton
          label="Swap"
          icon="compare-arrows"
          onPress={() =>
            onPressOption("SwapModal", {
              blockchain,
              title: token?.name,
              address,
            })
          }
        />
      ) : null}
    </XStack>
  );
}

function TransferButton({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: string;
  label: string;
  onPress: () => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{ alignItems: "center", opacity: disabled ? 0.5 : 1 }}
    >
      <Margin bottom={8}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            borderColor: theme.custom.colors.borderFull,
            backgroundColor: theme.custom.colors.nav,
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons
            name={icon}
            size={24}
            color={theme.custom.colors.fontColor}
          />
        </View>
      </Margin>
      <Text
        style={{
          color: theme.custom.colors.secondary,
          fontSize: 14,
          fontWeight: "500",
          lineHeight: 20,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
