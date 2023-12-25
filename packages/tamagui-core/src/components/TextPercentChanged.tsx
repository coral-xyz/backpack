import { StyledText } from "./StyledText";

export function TextPercentChanged({
  percentChange,
}: {
  percentChange?: number;
}): JSX.Element {
  const neutral = !!(
    percentChange &&
    (percentChange === 0 || percentChange.toFixed(2) === "0.00")
  );
  const positive = !!(percentChange && percentChange > 0);
  const negative = !!(percentChange && percentChange < 0);

  return (
    <>
      {percentChange !== undefined && neutral ? (
        <StyledText fontWeight="500" color="$baseTextMedEmphasis">
          {percentChange.toFixed(2)}%
        </StyledText>
      ) : percentChange !== undefined && positive ? (
        <StyledText fontWeight="500" color="$greenText">
          +{percentChange.toFixed(2)}%
        </StyledText>
      ) : percentChange !== undefined && negative ? (
        <StyledText fontWeight="500" color="$redText">
          {percentChange.toFixed(2)}%
        </StyledText>
      ) : (
        <StyledText fontWeight="500" color="$baseTextMedEmphasis">
          -
        </StyledText>
      )}
    </>
  );
}
