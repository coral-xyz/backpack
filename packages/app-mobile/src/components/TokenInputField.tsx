import type { BigNumber } from "ethers";

import { useState, useEffect, useRef } from "react";
import type {
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { TextInput } from "react-native";

import { toDisplayBalance } from "@coral-xyz/common";
import { useDebounce } from "@uidotdev/usehooks";
import { ethers } from "ethers";

import { StyledTextInput } from "~components/index";

export function StyledTokenTextInput({
  decimals,
  defaultValue,
  onChangeText,
  ...props
}: {
  decimals: number;
  defaultValue: BigNumber | null;
  onChangeText: (value: BigNumber | null) => void;
  props: TextInputProps;
}) {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string | null>(null);

  // // Clear input value (fall back to value prop) if focus changes
  // useEffect(() => {
  //   setInputValue(null);
  // }, [focused]);

  const handleChangeText = (amount: string) => {
    // Only allow numbers and periods
    if (!isNaN(amount) || amount === ".") {
      if (amount !== "") {
        const decimalIndex = amount.indexOf(".");
        const truncatedAmount =
          decimalIndex >= 0
            ? amount.substring(0, decimalIndex) +
              amount.substring(decimalIndex, decimalIndex + decimals + 1)
            : amount;

        setInputValue(truncatedAmount);
        const v = ethers.utils.parseUnits(truncatedAmount, decimals);
        onChangeText(v);
      } else {
        setInputValue(null);
        onChangeText(null);
      }
    }
  };

  // Don't interfere with the input field value while it is being typed in,
  // use local component state for the value if the input field is focused
  let value;
  if (focused && inputValue) {
    value = inputValue;
  } else if (defaultValue) {
    value = ethers.utils.formatUnits(defaultValue, decimals);
  } else {
    value = "";
  }

  return (
    <StyledTextInput
      keyboardType="decimal-pad"
      returnKeyType="done"
      defaultValue={value}
      onChangeText={handleChangeText}
      {...props}
    />
  );
}

export function UnstyledTokenTextInput({
  decimals,
  amount,
  onChangeAmount,
  style,
  ...props
}: {
  decimals: number;
  amount: BigNumber | undefined;
  onChangeAmount: (value: BigNumber | undefined) => void;
  style: StyleProp<ViewStyle & TextStyle>;
}) {
  const displayBalance = amount
    ? ethers.utils.formatUnits(amount, decimals)
    : "";

  const [inputValue, setInputValue] = useState(displayBalance);
  const debouncedValue = useDebounce(inputValue, 500);

  const handleChangeText = (value: string) => {
    setInputValue(value);
  };

  useEffect(() => {
    try {
      const value = debouncedValue;
      const parsedVal = value.length === 1 && value[0] === "." ? "0." : value;

      const num =
        parsedVal === "" || parsedVal === "0." ? 0.0 : parseFloat(parsedVal);

      if (num >= 0) {
        onChangeAmount(ethers.utils.parseUnits(num.toString(), decimals));
      }
    } catch (error) {
      console.error("UnstyledTokenTextInput:error", error);
      // Do nothing.
    }
  }, [debouncedValue]);

  return (
    <TextInput
      placeholder="0.0"
      keyboardType="decimal-pad"
      returnKeyType="done"
      defaultValue={displayBalance}
      onChangeText={handleChangeText}
      style={style}
      {...props}
    />
  );
}

export function TokenInputField({
  decimals,
  style,
  ...props
}: {
  decimals: number;
  style?: StyleProp<ViewStyle & TextStyle>;
}) {
  const textInputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string | null>(null);

  // Clear input value (fall back to value prop) if focus changes
  useEffect(() => {
    setInputValue(null);
  }, [focused]);

  // Truncate token input fields to the native decimals of the token to prevent
  // floats
  const handleTokenInput = (
    amount: string,
    decimals: number,
    setValue: (amount: BigNumber | null) => void
  ) => {
    if (amount !== "") {
      const decimalIndex = amount.indexOf(".");
      // Restrict the input field to the same amount of decimals as the token
      const truncatedAmount =
        decimalIndex >= 0
          ? amount.substring(0, decimalIndex) +
            amount.substring(decimalIndex, decimalIndex + decimals + 1)
          : amount;
      setInputValue(truncatedAmount);
      setValue(ethers.utils.parseUnits(truncatedAmount, decimals));
    } else {
      setInputValue(null);
      setValue(null);
    }
  };

  // Don't interfere with the input field value while it is being typed in,
  // use local component state for the value if the input field is focused
  let value;
  if (focused && inputValue) {
    value = inputValue;
  } else if (props.value) {
    value = ethers.utils.formatUnits(props.value, decimals);
  } else {
    value = "";
  }

  return (
    <TextInput
      {...props}
      ref={textInputRef}
      style={style}
      placeholder="0"
      keyboardType="decimal-pad"
      returnKeyType="done"
      value={value}
      onChangeText={(value: string) => {
        handleTokenInput(value.replace("-", ""), decimals, props.setValue);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onEndEditing={() => setFocused(false)}
      onSubmitEditing={() => setFocused(false)}
    />
  );
}
