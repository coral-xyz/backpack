import { StyledText } from "./StyledText";
import { View } from "..";

export function TextPercentChanged({
  percentChange,
  showBackground,
}: {
  percentChange?: number;
  showBackground?: boolean;
}): JSX.Element {
  const neutral = !!(
    percentChange &&
    (percentChange === 0 || percentChange.toFixed(2) === "0.00")
  );
  const positive = !!(percentChange && percentChange > 0);
  const negative = !!(percentChange && percentChange < 0);
  const color = (() => {
    if (percentChange !== undefined && neutral) {
      return "$baseTextMedEmphasis";
    }
    if (percentChange !== undefined && positive) {
      return "$greenText";
    }
    if (percentChange !== undefined && negative) {
      return "$redText";
    }
    return "$baseTextMedEmphasis";
  })();

  const inner = (
    <>
      {percentChange !== undefined && neutral ? (
        <StyledText fontWeight="500" color={color}>
          {percentChange.toFixed(2)}%
        </StyledText>
      ) : percentChange !== undefined && positive ? (
        <StyledText fontWeight="500" color={color}>
          +{percentChange.toFixed(2)}%
        </StyledText>
      ) : percentChange !== undefined && negative ? (
        <StyledText fontWeight="500" color={color}>
          {percentChange.toFixed(2)}%
        </StyledText>
      ) : (
        <StyledText fontWeight="500" color={color}>
          -
        </StyledText>
      )}
    </>
  );

  if (!showBackground) {
    return inner;
  }

  return <View bg="$redText">{inner}</View>;
}
