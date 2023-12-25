import { useState } from "react";

import {
  EyeOffIcon,
  EyeIcon,
  IconProps,
  Input,
  InputProps,
  Stack,
} from "../../index";

export function BpPasswordInput({
  hasError,
  ...currentInputProps
}: InputProps & {
  passwordIconProps?: IconProps;
  hasError?: boolean;
}) {
  return (
    <PasswordInputBase
      secureTextEntry
      placeholderTextColor="$baseIcon"
      borderRadius={12}
      paddingVertical="$5"
      paddingHorizontal="$4"
      fontWeight="$medium"
      blurOnSubmit={false}
      width="100%"
      placeholder="Password"
      borderWidth={2}
      outlineWidth={0}
      passwordIconProps={{
        color: "$baseIcon",
      }}
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
      {...currentInputProps}
    />
  );
}

function PasswordInputBase(
  currentInputProps: InputProps & {
    passwordIconProps?: IconProps;
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
        borderColor="$baseBorderLight"
        placeholderTextColor="$baseTextMedEmphasis"
        height="$input"
        autoFocus
        {...currentInputProps}
        secureTextEntry={!show}
        autoCapitalize="none"
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
