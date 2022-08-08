import { ethers, BigNumber } from "ethers";
import { TextField } from "./";

export function TokenInputField({
  decimals,
  ...props
}: {
  decimals: number;
} & React.ComponentProps<typeof TextField>) {
  // Truncate token input fields to the native decimals of the token to prevent
  // floats
  const handleTokenInput = (
    amount: string,
    decimals: number,
    setValue: (
      displayAmount: string | null,
      nativeAmount: BigNumber | null
    ) => void
  ) => {
    if (amount !== "") {
      const decimalIndex = amount.indexOf(".");
      const truncatedAmount =
        decimalIndex >= 0
          ? amount.substring(0, decimalIndex) +
            amount.substring(decimalIndex, decimalIndex + decimals + 1)
          : amount;
      setValue(
        truncatedAmount,
        ethers.utils.parseUnits(truncatedAmount, decimals)
      );
    } else {
      setValue(null, null);
    }
  };

  return (
    <TextField
      {...props}
      // Override default TextField setValue with function to truncate decimal inputs
      setValue={(amount: string) => {
        handleTokenInput(amount, decimals, props.setValue);
      }}
    />
  );
}
