import { Pressable } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import { Circle, StyledText, XStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";

import { useTheme } from "~src/hooks/useTheme";
import { Token, NavTokenOptions } from "~src/types/types";

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
    <XStack space={24} ai="center" alignSelf="center" jc="center">
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
      <Circle
        mb={8}
        bg="$card"
        borderColor="$borderFull"
        borderWidth={1}
        size={56}
        shadowRadius={1}
        shadowColor="rgba(0, 0, 0, 0.02)"
        shadowOffset={{
          width: 1,
          height: 1,
        }}
      >
        <MaterialIcons
          name={icon}
          size={24}
          color={theme.custom.colors.fontColor}
        />
      </Circle>
      <StyledText color="$baseTextMedEmphasis">{label}</StyledText>
    </Pressable>
  );
}
