import { formatUsd } from "@coral-xyz/common";

import { StyledText } from "./StyledText";

export function TextPercentChanged({
  percentChange,
}: {
  percentChange: number;
}): JSX.Element {
  const positive = !!(percentChange && percentChange > 0);
  const negative = !!(percentChange && percentChange < 0);
  const neutral = !!(percentChange && percentChange === 0);

  return (
    <>
      {percentChange !== undefined && positive ? (
        <StyledText fontWeight="500" color="$positive">
          +{formatUsd(percentChange.toLocaleString())}
        </StyledText>
      ) : null}
      {percentChange !== undefined && negative ? (
        <StyledText fontWeight="500" color="$negative">
          {formatUsd(percentChange.toLocaleString())}
        </StyledText>
      ) : null}
      {percentChange !== undefined && neutral ? (
        <StyledText fontWeight="500" color="$secondary">
          {formatUsd(percentChange.toLocaleString())}
        </StyledText>
      ) : null}
    </>
  );
}
