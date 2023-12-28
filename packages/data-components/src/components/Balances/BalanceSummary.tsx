import { formatUsd } from "@coral-xyz/common";
import {
  type ColorTokens,
  Skeleton,
  type StackProps,
  StyledText,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

export type BalanceSummaryProps = {
  percentChange: number;
  value: number;
  valueChange: number;
  style?: Omit<StackProps, "children">;
};

export function BalanceSummary({
  percentChange,
  value,
  valueChange,
  style,
}: BalanceSummaryProps) {
  return (
    <YStack alignItems="center" justifyContent="center" {...style}>
      <StyledText fontSize="$4xl" fontWeight="700">
        {formatUsd(value)}
      </StyledText>
      <XStack alignItems="center" gap={8}>
        <ValueChange value={valueChange} />
        <PercentChange value={percentChange} />
      </XStack>
    </YStack>
  );
}

export function BalanceSummaryLoader() {
  return (
    <YStack
      alignItems="center"
      marginHorizontal={12}
      marginTop={24}
      paddingHorizontal={24}
      gap={12}
    >
      <Skeleton radius={16} height={32} />
      <Skeleton radius={8} height={16} width={165} />
    </YStack>
  );
}

function ValueChange({ value }: { value: number }) {
  const truncatedValue = parseFloat(value.toFixed(2));
  const usd = formatUsd(truncatedValue);
  const displayValue = usd === "-$0.00" ? "$0.00" : usd;

  return (
    <StyledText color={colorByValue(truncatedValue).foreground}>
      {displayValue}
    </StyledText>
  );
}

export function PercentChange({
  removeBackground,
  value,
}: {
  removeBackground?: boolean;
  value: number;
}) {
  const truncatedValue = parseFloat(value.toFixed(2));
  const { foreground, background } = colorByValue(truncatedValue);
  return (
    <StyledText
      color={foreground}
      backgroundColor={removeBackground ? undefined : background}
      borderRadius={28}
      lineHeight={24}
      paddingHorizontal={8}
      paddingVertical={2}
    >
      {truncatedValue > 0 ? "+" : ""}
      {Number.isFinite(truncatedValue) ? `${truncatedValue}%` : "0.00%"}
    </StyledText>
  );
}

const colorByValue = (
  value: number
): { foreground: ColorTokens[number]; background: ColorTokens[number] } =>
  value === 0
    ? { foreground: "$baseTextMedEmphasis", background: "$colorTransparent" }
    : value < 0
    ? { foreground: "$redText", background: "$redBackgroundTransparent" }
    : { foreground: "$greenText", background: "$greenBackgroundTransparent" };
