import { Image } from "expo-image";

import { StyledText, XStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import {
  PlatformPressable,
  HeaderBackButtonProps,
} from "@react-navigation/elements";

import { IconDropdown } from "~components/Icon";
import { CurrentUserAvatar } from "~components/UserAvatar";

type HeaderButtonProps = HeaderBackButtonProps & {
  name: string;
};

export function HeaderButton({ name, tintColor, ...rest }: HeaderButtonProps) {
  return (
    <PlatformPressable {...rest}>
      <MaterialIcons name={name} size={32} color={tintColor} />
    </PlatformPressable>
  );
}

export function HeaderCloseButton({
  tintColor,
  ...rest
}: HeaderBackButtonProps) {
  return (
    <PlatformPressable {...rest}>
      <Image
        source={require("~src/images/icons/close.png")}
        style={{ width: 20, height: 20 }}
      />
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
      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
      {...rest}
    >
      <StyledText fontSize="$xl" color={tintColor}>
        {children}
      </StyledText>
      <IconDropdown size={24} color="$baseIcon" />
    </PlatformPressable>
  );
}

export function HeaderAvatarButton(props) {
  return (
    <PlatformPressable
      {...props}
      onPress={() => {
        props.navigation.openDrawer();
      }}
    >
      <CurrentUserAvatar size={44} />
    </PlatformPressable>
  );
}

export const HeaderButtonSpacer = ({
  children,
}: {
  children: React.ReactNode;
}) => <XStack mx={16}>{children}</XStack>;
