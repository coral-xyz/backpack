import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCustomTheme } from "../hooks/index";
import { HOVER_OPACITY } from "../theme";
export { SearchBox } from "./SearchBox";

export function Margin({
  bottom,
  top,
  left,
  right,
  horizontal,
  vertical,
  children,
}: {
  bottom?: number | string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  horizontal?: number | string;
  vertical?: number | string;
  children: any;
}): JSX.Element {
  const style = {};
  if (bottom) {
    // @ts-ignore
    style.marginBottom = bottom;
  }

  if (top) {
    // @ts-ignore
    style.marginTop = top;
  }

  if (left) {
    // @ts-ignore
    style.marginLeft = left;
  }

  if (right) {
    // @ts-ignore
    style.marginRight = right;
  }

  if (horizontal) {
    // @ts-ignore
    style.marginHorizontal = horizontal;
  }

  if (vertical) {
    // @ts-ignore
    style.marginVertical = vertical;
  }

  return <View style={style}>{children}</View>;
}

export function BaseButton({
  label,
  buttonStyle,
  labelStyle,
  onPress,
  disabled,
  loading,
  icon,
  ...props
}: {
  label: string;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ hovered }: any) => {
        return [
          baseButtonStyles.button,
          {
            opacity: hovered ? HOVER_OPACITY : disabled ? 0.7 : 1,
          },
          buttonStyle,
        ];
      }}
      {...props}
    >
      <Text
        style={[
          baseButtonStyles.label,
          {
            opacity: disabled ? 0.5 : 1,
          },
          labelStyle,
        ]}
      >
        {loading ? "loading..." : label}
      </Text>
      {icon ? <Margin left={8}>{icon}</Margin> : null}
    </Pressable>
  );
}

const baseButtonStyles = StyleSheet.create({
  button: {
    userSelect: "none",
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  label: {
    fontWeight: "500",
    fontSize: 16,
  },
});

export function LinkButton({
  label,
  onPress,
  disabled,
  loading,
  ...props
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: "transparent" }}
      labelStyle={{
        color: theme.custom.colors.secondaryButtonTextColor,
      }}
      {...props}
    />
  );
}

export function PrimaryButton({
  label,
  onPress,
  onClick,
  disabled,
  loading,
  ...props
}: {
  label: string;
  onPress?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <BaseButton
      label={label}
      onPress={onClick || onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.primaryButton }}
      labelStyle={{
        color: theme.custom.colors.primaryButtonTextColor,
      }}
      {...props}
    />
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  ...props
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
}) {
  const theme = useCustomTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.secondaryButton }}
      labelStyle={{
        color: theme.custom.colors.secondaryButtonTextColor,
      }}
      icon={icon}
      {...props}
    />
  );
}

export function NegativeButton({
  label,
  onPress,
  disabled,
  loading,
  ...props
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.negative }}
      labelStyle={{
        color: theme.custom.colors.negativeButtonTextColor,
      }}
      {...props}
    />
  );
}

export function DangerButton({
  label,
  onPress,
  disabled,
  loading,
  ...props
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.negative }}
      labelStyle={{
        color: theme.custom.colors.fontColor,
      }}
      {...props}
    />
  );
}
