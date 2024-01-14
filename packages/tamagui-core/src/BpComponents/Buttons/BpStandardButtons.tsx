import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";

import { ButtonProps, Button } from "tamagui";

import { useTheme as useTamaguiTheme } from "../..";
import { StyledText } from "../../components/index";

const BpBaseButton = React.forwardRef(_BpBaseButton);
export const BpPrimaryButton = React.forwardRef(_BpPrimaryButton);
export const BpSecondaryButton = React.forwardRef(_BpSecondaryButton);
export const BpPositiveButton = React.forwardRef(_BpPositiveButton);
export const BpLinkButton = React.forwardRef(_BpLinkButton);
export const BpNegativeButton = React.forwardRef(_BpNegativeButton);
export const BpDangerButton = BpNegativeButton;

function _BpBaseButton(
  {
    label,
    loading,
    icon,
    iconBefore,
    iconAfter,
    onPress,
    labelProps,
    ...buttonProps
  }: {
    label: string | React.ReactNode;
    loading?: boolean;
    icon?: JSX.Element;
    iconBefore?: JSX.Element;
    iconAfter?: JSX.Element;
    labelProps?: React.ComponentProps<typeof StyledText>;
    onPress?: ButtonProps["onPress"];
  } & ButtonProps,
  ref
) {
  return (
    <Button
      ref={ref}
      height="auto"
      width="100%"
      space="$3"
      justifyContent="center"
      alignItems="center"
      flexGrow={1}
      flexShrink={0}
      padding="$3"
      borderRadius={12}
      borderWidth="0"
      outlineWidth="0"
      backgroundColor="$buttonPrimaryBackground"
      opacity={buttonProps.disabled ? 0.7 : 1}
      hoverStyle={{
        ...buttonProps,

        opacity: 0.9,
      }}
      pressStyle={{
        ...buttonProps,
        opacity: 0.8,
      }}
      focusStyle={{
        ...buttonProps,
      }}
      onPress={onPress}
      {...buttonProps}
    >
      {iconBefore ? iconBefore : null}
      <StyledText color="$buttonPrimaryText" fontWeight="$bold" {...labelProps}>
        {label}
      </StyledText>
      {icon || iconAfter ? icon || iconAfter : null}
      {loading ? <ActivityIndicator size="small" /> : null}
    </Button>
  );
}

function _BpLinkButton(props: React.ComponentProps<typeof BpBaseButton>, ref) {
  return (
    <BpBaseButton
      ref={ref}
      backgroundColor="transparent"
      borderWidth="0"
      outlineWidth="0"
      labelProps={{
        color: "$baseTextHighEmphasis",
      }}
      {...props}
    />
  );
}

function _BpPrimaryButton(
  props: React.ComponentProps<typeof BpBaseButton>,
  ref
) {
  return (
    <BpBaseButton
      ref={ref}
      backgroundColor="$buttonPrimaryBackground"
      labelProps={{
        color: "$buttonPrimaryText",
      }}
      {...props}
    />
  );
}
function _BpSecondaryButton(
  props: React.ComponentProps<typeof BpBaseButton>,
  ref
) {
  const theme = useTamaguiTheme();
  return (
    <BpBaseButton
      ref={ref}
      backgroundColor="$buttonSecondaryBackground"
      labelProps={{
        color: "$buttonSecondaryText",
      }}
      {...props}
    />
  );
}

function _BpNegativeButton(
  props: React.ComponentProps<typeof BpBaseButton>,
  ref
) {
  return (
    <BpBaseButton
      ref={ref}
      backgroundColor="$redText"
      labelProps={{
        color: "$baseTextHighEmphasis",
      }}
      {...props}
    />
  );
}

function _BpPositiveButton(
  props: React.ComponentProps<typeof BpBaseButton>,
  ref
) {
  return (
    <BpBaseButton
      ref={ref}
      backgroundColor="$greenText"
      labelProps={{
        color: "$baseTextHighEmphasis",
      }}
      {...props}
    />
  );
}
