import { Alert, Dimensions, Platform } from "react-native";

import { StyledText } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import {
  PlatformPressable,
  HeaderBackButton,
  HeaderBackButtonProps,
} from "@react-navigation/elements";

type HeaderButtonProps = HeaderBackButtonProps & {
  name: string;
};

export function HeaderButton({ name, tintColor, ...rest }: HeaderButtonProps) {
  return (
    <PlatformPressable style={{ marginHorizontal: 12 }} {...rest}>
      <MaterialIcons name={name} size={24} color={tintColor} />
    </PlatformPressable>
  );
}
