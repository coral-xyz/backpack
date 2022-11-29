import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { TextInput } from "react-native";

export function TokenInputField({
  decimals,
  // value,
  // setValue,
  ...props
}: {
  decimals: number;
  // value: string;
  // setValue: (amount: BigNumber | null) => void,
}) {
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
      autoCorrect={false}
      autoCapitalize="none"
      {...props}
      value={value}
      // Override default TextField setValue with function to truncate decimal inputs
      onChangeText={(amount) => {
        console.log("onChangeText:amount", amount);
        handleTokenInput(
          amount,
          // e.target.value,
          // e.target.value.replace("-", ""),
          decimals,
          props.setValue
        );
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      // inputProps={{
      //   ...props.inputProps,
      //   onFocus: () => setFocused(true),
      //   onBlur: () => setFocused(false),
      // }}
    />
  );
}
