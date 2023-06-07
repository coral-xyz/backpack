import { StyledText } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import {
  PlatformPressable,
  HeaderBackButtonProps,
} from "@react-navigation/elements";

import { IconDropdown } from "~components/Icon";

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

export function HeaderDropdownButton({
  onPress,
  tintColor,
  children,
  ...rest
}: any) {
  return (
    <PlatformPressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center" }}
      {...rest}
    >
      <StyledText color={tintColor}>{children}</StyledText>
      <IconDropdown size={22} color="$baseTextMedEmphasis" />
    </PlatformPressable>
  );
}
