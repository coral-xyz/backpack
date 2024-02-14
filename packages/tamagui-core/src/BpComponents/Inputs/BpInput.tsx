import { useFocusEffect } from "@react-navigation/native";
import { useRef } from "react";
import { Input, type InputProps, YStack, type StackProps } from "tamagui";

export function BpInput(
  props: InputProps & {
    hasError?: boolean;
    iconStart?: JSX.Element;
    iconEnd?: JSX.Element;
  }
) {
  const ref = useRef(null);
  useAutoFocusDelay(ref, props?.autoFocus ?? false);
  return (
    <BpInputInner
      {...{
        ...props,
        ref,
      }}
    />
  );
}

// This is used externally when the input is not inside a stack navigator.
// If possible use `BpInput` instead--that is, until the rest of the app,
// namely the onboarding experience, is inside a stack navigator.
export function BpInputInner({
  hasError,
  iconStart,
  iconEnd,
  wrapperProps,
  ...inputProps
}: InputProps & {
  hasError?: boolean;
  iconStart?: JSX.Element;
  iconEnd?: JSX.Element;
  wrapperProps?: StackProps;
}) {
  return (
    <YStack position="relative" justifyContent="center" {...wrapperProps}>
      <Input
        placeholderTextColor="$baseIcon"
        borderRadius={12}
        paddingVertical="$4.5"
        paddingLeft={iconStart ? "$8" : "$4"}
        paddingRight={iconEnd ? "$8" : "$4"}
        fontWeight="$medium"
        blurOnSubmit={false}
        width="100%"
        borderWidth={2}
        outlineWidth="$0"
        color="$baseTextHighEmphasis"
        borderColor={hasError ? "$redBorder" : "transparent"}
        focusStyle={{
          borderWidth: 2,
          outlineWidth: 0,
          borderColor: hasError ? "$redBorder" : "$accentBlue",
        }}
        hoverStyle={{
          borderWidth: 2,
          outlineWidth: 0,
          borderColor: hasError ? "$redBorder" : "",
        }}
        backgroundColor="$baseBackgroundL1"
        {...inputProps}
        autoFocus={false}
      />
      {iconStart ? (
        <YStack
          position="absolute"
          paddingLeft="$3"
          top={0}
          left={0}
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          {iconStart}
        </YStack>
      ) : null}
      {iconEnd ? (
        <YStack
          position="absolute"
          paddingRight="$3"
          top={0}
          right={0}
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          {iconEnd}
        </YStack>
      ) : null}
    </YStack>
  );
}

export function useAutoFocusDelay(
  ref: any,
  autoFocus: boolean,
  delayOverride?: number
) {
  // We delay the focus to give time for the react native navigation to
  // finish animating. If we don't do this, the stack navigator animation
  // gets wonky.
  useFocusEffect(() => {
    setTimeout(() => {
      if (autoFocus) {
        // @ts-ignore
        ref?.current?.focus();
      }
    }, delayOverride ?? 250);
  });
}
