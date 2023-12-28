import { Input, InputProps, YStack } from "../../index";

export function BpInput({
  hasError,
  iconStart,
  iconEnd,
  ...inputProps
}: InputProps & {
  hasError?: boolean;
  iconStart?: JSX.Element;
  iconEnd?: JSX.Element;
}) {
  return (
    <YStack position="relative" justifyContent="center">
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
