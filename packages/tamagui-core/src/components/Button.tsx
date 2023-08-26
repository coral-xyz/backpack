import type { StyleProp, ViewStyle } from "react-native";
import { Platform, Pressable, StyleSheet } from "react-native";
import { HOVER_OPACITY } from "@coral-xyz/themes";
import { Text } from "tamagui";

import { useCustomTheme } from "../hooks/index";

import { Margin } from "./index";

export function BaseButton({
  label,
  buttonStyle,
  labelStyle,
  onPress,
  disabled,
  loading,
  icon,
  iconBefore,
  iconAfter,
  ...props
}: {
  label: string;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle: { color: string };
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  iconBefore?: JSX.Element;
  iconAfter?: JSX.Element;
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
      {iconBefore ? <Margin right={2}>{iconBefore}</Margin> : null}
      <Text
        fontSize={16}
        fontWeight="600"
        fontFamily="Inter"
        color={labelStyle.color}
        style={[
          {
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {loading ? "loading..." : label}
      </Text>
      {icon || iconAfter ? <Margin left={2}>{icon || iconAfter}</Margin> : null}
    </Pressable>
  );
}

const baseButtonStyles = StyleSheet.create({
  button: {
    userSelect: "none",
    height: Platform.select({ native: 56, web: 48 }),
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
});

export function LinkButton({
  label,
  onPress,
  disabled,
  loading,
  iconBefore,
  ...props
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  iconBefore?: JSX.Element;
}) {
  const theme = useCustomTheme();
  return (
    <BaseButton
      label={label}
      iconBefore={iconBefore}
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
  icon,
  ...props
}: {
  label: string;
  onPress?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
}) {
  const theme = useCustomTheme();
  return (
    <BaseButton
      label={label}
      onPress={onClick || onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: theme.custom.colors.primaryButton }}
      icon={icon}
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
      buttonStyle={{ backgroundColor: theme.custom.colors.negative }}
      labelStyle={{
        color: theme.custom.colors.fontColor,
      }}
      {...props}
    />
  );
}
