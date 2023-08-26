import type { BigNumber } from "ethers";

import type { StyleProp, ViewStyle } from "react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from "react-native";

import { XStack, YStack } from "@coral-xyz/tamagui";
import { ethers } from "ethers";
import { Controller } from "react-hook-form";

import { ErrorMessage } from "~src/components/ErrorMessage";
import { useTheme } from "~src/hooks/useTheme";

// Wraps multiple components in one singular input group with a shared border
export function InputGroup({
  hasError,
  children,
  errorMessage,
}: {
  hasError?: boolean;
  children: JSX.Element | JSX.Element[];
  errorMessage?: string;
}): JSX.Element {
  const theme = useTheme();
  const borderColor = hasError
    ? theme.custom.colors.negative
    : theme.custom.colors.textInputBorderFull;
  return (
    <>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: theme.custom.colors.textBackground,
          },
        ]}
      >
        {children}
      </View>

      {errorMessage ? (
        <Text
          style={{ ...styles.errorText, color: theme.custom.colors.negative }}
        >
          {errorMessage}
        </Text>
      ) : null}
    </>
  );
}

// Wraps a single input component with a label and error message
export function InputListItem({
  autoFocus,
  title,
  placeholder,
  control,
  rules,
  secureTextEntry,
  name,
  ...props
}: TextInputProps & {
  autoFocus?: boolean;
  title: string;
  placeholder?: string;
  control: any;
  rules: any;
  secureTextEntry?: boolean;
  name: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <XStack height={48} ai="center" jc="space-between">
      <Text style={[styles.label, { color: theme.custom.colors.fontColor }]}>
        {title}
      </Text>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoFocus={autoFocus}
            style={[
              styles.input,
              {
                color: theme.custom.colors.fontColor2,
              },
            ]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={theme.custom.colors.textPlaceholder}
            secureTextEntry={secureTextEntry}
            {...props}
          />
        )}
      />
    </XStack>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 2,
  },
  label: {
    paddingLeft: 16,
    width: 80,
    overflow: "hidden",
    fontWeight: "500",
    fontSize: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    fontWeight: "500",
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
  },
});

// Simple label with a text input
export function InputField({
  leftLabel,
  rightLabel,
  rightLabelComponent,
  children,
}: {
  rightLabel?: string;
  rightLabelComponent?: JSX.Element;
  children: JSX.Element;
  hasError?: boolean;
}): JSX.Element {
  return (
    <View style={{ marginBottom: 24 }}>
      <InputFieldLabel
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        rightLabelComponent={rightLabelComponent}
      />
      <View>{children}</View>
    </View>
  );
}

export function InputFieldLabel({
  leftLabel,
  rightLabel,
  rightLabelComponent,
  style,
}: {
  leftLabel: string;
  rightLabel?: string;
  rightLabelComponent?: JSX.Element;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={[inputFieldLabelStyles.container, style]}>
      <Text
        style={[
          inputFieldLabelStyles.leftLabel,
          {
            color: theme.custom.colors.fontColor,
          },
        ]}
      >
        {leftLabel}
      </Text>
      {rightLabelComponent ? (
        rightLabelComponent
      ) : (
        <Text
          style={[
            inputFieldLabelStyles.rightLabel,
            {
              color: theme.custom.colors.interactiveIconsActive,
            },
          ]}
        >
          {rightLabel}
        </Text>
      )}
    </View>
  );
}

const inputFieldLabelStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leftLabel: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "500",
  },
  rightLabel: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
  },
});

export const InputFieldMaxLabel = ({
  amount,
  onSetAmount,
  decimals,
  label = "Max:",
}: {
  amount: BigNumber | null;
  onSetAmount: (amount: BigNumber) => void;
  decimals: number;
  label?: string;
}) => {
  const theme = useTheme();
  return (
    <Pressable
      style={inputFieldMaxLabelStyles.container}
      onPress={() => amount && onSetAmount(amount)}
    >
      <Text
        style={[
          inputFieldMaxLabelStyles.label,
          { color: theme.custom.colors.secondary },
        ]}
      >
        {label}{" "}
      </Text>
      <Text
        style={[
          inputFieldMaxLabelStyles.label,
          {
            color: theme.custom.colors.fontColor,
          },
        ]}
      >
        {amount !== null ? ethers.utils.formatUnits(amount, decimals) : "-"}
      </Text>
    </Pressable>
  );
};

const inputFieldMaxLabelStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  label: {
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
  },
});

export function InputForm({
  children,
  hasError,
  errorMessage,
}: {
  children: React.ReactNode;
  hasError: boolean;
  errorMessage?: string | undefined;
}) {
  return (
    <YStack space={8}>
      {children}
      {hasError && errorMessage ? (
        <YStack mx={4} ai="center" als="center">
          <ErrorMessage for={{ message: errorMessage }} />
        </YStack>
      ) : null}
    </YStack>
  );
}

export function Group({
  children,
  errorMessage,
}: {
  children: React.ReactNode;
  errorMessage?: string;
}) {
  return (
    <YStack space={4} mb={8}>
      {children}
      {errorMessage ? (
        <YStack mx={4} ai="center" als="center">
          <ErrorMessage for={{ message: errorMessage }} />
        </YStack>
      ) : null}
    </YStack>
  );
}

export function Wrapper({ children }: { children: React.ReactNode }) {
  return <YStack space={8}>{children}</YStack>;
}

export function Input({
  children,
  errorMessage,
}: {
  children: React.ReactNode;
  errorMessage?: string;
}) {
  return (
    <YStack space={4} mb={8}>
      {children}
      {errorMessage ? (
        <YStack mx={4} ai="center" als="center">
          <ErrorMessage for={{ message: errorMessage }} />
        </YStack>
      ) : null}
    </YStack>
  );
}
