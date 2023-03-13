import type { BigNumber } from "ethers";

import { useState } from "react";
import type {
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { TextInput } from "react-native";

import { toDisplayBalance } from "@coral-xyz/common";
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
  amount: BigNumber | null;
  onChangeAmount: (value: BigNumber | null) => void;
  style: StyleProp<ViewStyle & TextStyle>;
}) {
  const handleChangeText = (value: string) => {
    try {
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
  };

  return (
    <TextInput
      placeholder="0.0"
      keyboardType="decimal-pad"
      returnKeyType="done"
      defaultValue={amount ? toDisplayBalance(amount, decimals) : ""}
      onChangeText={handleChangeText}
      style={style}
      {...props}
    />
  );
}
