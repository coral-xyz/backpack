import type { ReactNode } from "react";

import { StyledText } from "@coral-xyz/tamagui";

export function RequestHeader({ children }: { children: ReactNode }) {
  return (
    <StyledText fontSize="$lg" fontWeight="$bold" textAlign="center">
      {children}
    </StyledText>
  );
}
