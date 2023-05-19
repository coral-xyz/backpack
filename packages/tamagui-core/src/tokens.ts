import { size, space, zIndex } from "@tamagui/themes";
import { createTokens } from "tamagui";

import { color } from "./colors";

export const tokens = createTokens({
  color,
  space,
  size: {
    ...size,
    xs: 12,
    sm: 14,
    base: 16,
    true: 16, // true is always default
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 36,
    "6xl": 40,
    borderWidth: 2,
    container: 56,
  },
  zIndex,
  radius: {
    container: 12,
    large: 16,
    medium: 8,
    true: 8, // true is always default
    small: 4,
  },
});
