import { memo } from "react";

import { Stack, StyledText } from "@coral-xyz/tamagui";

// used in token prices
type PriceChangePillProps = {
  percentChange: number;
  price: number;
};

export const PriceChangePill = memo(
  ({ percentChange, price }: PriceChangePillProps) => {
    const bgColor =
      percentChange > 0 ? "$greenBackgroundSolid" : "$redBackgroundSolid";
    const textColor = percentChange > 0 ? "$greenText" : "$redText";

    return (
      <Stack borderRadius={8} bg={bgColor} p={8}>
        <StyledText size="$lg" color={textColor}>
          {price}
        </StyledText>
      </Stack>
    );
  }
);

// used in balance summary widget
type PercentChangePillProps = {
  percentChange: number;
};

export const PercentChangePill = memo(
  ({ percentChange }: PercentChangePillProps) => {
    const bgColor =
      percentChange > 0 ? "$greenBackgroundSolid" : "$redBackgroundSolid";
    const textColor = percentChange > 0 ? "$greenText" : "$redText";

    return (
      <Stack borderRadius={16} bg={bgColor} p={8}>
        <StyledText size="$lg" color={textColor}>
          {percentChange}
        </StyledText>
      </Stack>
    );
  }
);
