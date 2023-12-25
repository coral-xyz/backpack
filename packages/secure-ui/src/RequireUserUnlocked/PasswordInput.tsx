import type { IconProps, InputProps } from "@coral-xyz/tamagui";

import { useState } from "react";

import { EyeIcon, EyeOffIcon, Input, Stack } from "@coral-xyz/tamagui";

export function PasswordInput(
  currentInputProps: InputProps & {
    passwordIconProps: IconProps;
  }
) {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Stack
      position="relative"
      width={currentInputProps?.width ? currentInputProps?.width : "100%"}
    >
      <Input
        backgroundColor="$baseBackgroundL1"
        borderRadius="$medium"
        placeholderTextColor="$baseTextMedEmphasis"
        secureTextEntry={!show}
        height="$input"
        autoCapitalize="none"
        {...currentInputProps}
        autoFocus
        borderWidth={2}
        borderColor="transparent"
        outlineWidth={0}
        focusStyle={{
          borderColor: "$accentBlue",
          outlineWidth: 0,
        }}
        hoverStyle={{
          outlineWidth: 0,
          borderColor: "transparent",
        }}
      />
      <Stack
        style={{
          position: "absolute",
          top: "50%",
          transform: [{ translateY: -0.5 * 20 }],
          height: 20,
          ...(currentInputProps?.direction === "rtl"
            ? {
                left: 15,
              }
            : {
                right: 15,
              }),
        }}
        onPress={() => {
          setShow((state) => !state);
        }}
      >
        {show ? (
          <EyeOffIcon {...currentInputProps.passwordIconProps} />
        ) : (
          <EyeIcon {...currentInputProps.passwordIconProps} />
        )}
      </Stack>
    </Stack>
  );
}
