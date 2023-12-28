import type { StyleProp, ViewStyle } from "react-native";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";

import { Text, TextProps } from "tamagui";

import { HOVER_OPACITY } from "./../colorsv2";
import { Margin } from "./index";
import { useTheme as useTamaguiTheme } from "../";

const HEIGHT = {
  "extra-large": Platform.select({ native: 56, web: 48 }),
  large: Platform.select({ native: 50, web: 50 }),
  medium: Platform.select({ native: 40, web: 40 }),
  small: Platform.select({ native: 56, web: 48 }),
};

const FONT_SIZE = {
  "extra-large": 18,
  large: 15,
  medium: 15,
  small: 14,
};

export function BaseButton({
  label,
  buttonStyle,
  labelStyle,
  size = "extra-large",
  onPress,
  disabled,
  loading,
  icon,
  iconBefore,
  iconAfter,
  ...props
}: {
  label: string | React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle?: TextProps;
  onPress?: () => void;
  size?: "extra-large" | "large" | "medium" | "small";
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  iconBefore?: JSX.Element;
  iconAfter?: JSX.Element;
}) {
  return (
    <Pressable
      android_ripple={{
        borderless: false,
        color: "rgba(0, 0, 0, 0.2)",
        foreground: true,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ hovered, pressed }: any) => {
        return [
          baseButtonStyles.button,
          {
            height: HEIGHT[size],
          },
          {
            opacity: hovered || pressed ? HOVER_OPACITY : disabled ? 0.7 : 1,
          },
          buttonStyle,
        ];
      }}
      {...props}
    >
      {iconBefore ? <Margin right={2}>{iconBefore}</Margin> : null}
      <Text
        fontSize={labelStyle?.fontSize ?? FONT_SIZE[size]}
        fontWeight="600"
        fontFamily="$body"
        color={labelStyle?.color}
        style={[
          {
            opacity: loading ? 0.7 : disabled ? 0.5 : 1,
          },
        ]}
      >
        {label}
      </Text>
      {icon || iconAfter ? <Margin left={2}>{icon || iconAfter}</Margin> : null}
      {loading ? (
        <Margin left={8}>
          <ActivityIndicator size="small" />
        </Margin>
      ) : null}
    </Pressable>
  );
}

const baseButtonStyles = StyleSheet.create({
  button: {
    userSelect: "none",
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
} & React.ComponentProps<typeof BaseButton>) {
  const theme = useTamaguiTheme();
  return (
    <BaseButton
      label={label}
      iconBefore={iconBefore}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{ backgroundColor: "transparent" }}
      {...props}
      labelStyle={{
        color: theme.buttonSecondaryText.val,
        ...props.labelStyle,
      }}
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
  inverted,
  ...props
}: {
  label: string;
  onPress?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  inverted?: boolean;
} & React.ComponentProps<typeof BaseButton>) {
  const theme = useTamaguiTheme();
  return (
    <BaseButton
      label={label}
      onPress={onClick || onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{
        backgroundColor: inverted
          ? theme.buttonSecondaryBackground.val
          : theme.buttonPrimaryBackground.val,
      }}
      icon={icon}
      {...props}
      labelStyle={{
        // @ts-ignore
        color: inverted
          ? theme.buttonSecondaryText.val
          : theme.buttonPrimaryText.val,
        ...props.labelStyle,
      }}
    />
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  inverted,
  labelStyle,
  ...props
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  inverted?: boolean;
} & React.ComponentProps<typeof BaseButton>) {
  const theme = useTamaguiTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{
        backgroundColor: inverted
          ? theme.buttonPrimaryBackground.val
          : theme.buttonSecondaryBackground.val,
      }}
      labelStyle={{
        color: inverted
          ? theme.buttonPrimaryText.val
          : theme.buttonSecondaryText.val,
        ...labelStyle,
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
  variant = "light",
  labelStyle,
  ...props
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "light" | "dark";
  labelStyle?: { fontSize?: number };
}) {
  const theme = useTamaguiTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{
        backgroundColor: theme.redBackgroundSolid.val,
      }}
      labelStyle={{
        color: theme.redText.val,
        ...labelStyle,
      }}
      {...props}
    />
  );
}

export function PositiveButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "light",
  labelStyle,
  ...props
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "light" | "dark";
  labelStyle?: { fontSize?: number };
}) {
  const tamaguiTheme = useTamaguiTheme();
  return (
    <BaseButton
      label={label}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      buttonStyle={{
        backgroundColor:
          variant === "light"
            ? tamaguiTheme.greenText.val
            : tamaguiTheme.greenText.val,
      }}
      labelStyle={{
        color: tamaguiTheme.buttonPrimaryText.val,
        ...labelStyle,
      }}
      {...props}
    />
  );
}

export const DangerButton = NegativeButton;
