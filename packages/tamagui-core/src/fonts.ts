// import type { GenericFont } from "@tamagui/web";
import { createFont, isWeb } from "@tamagui/core";

const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  true: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
} as const;

const lineHeights = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  "2xl": 32,
  "3xl": 36,
  "4xl": 40,
  "5xl": 48,
  "6xl": 60,
} as const;

// Inter Weights
// - Regular 400
// - Medium 500
// - Semi-bold 600
// - Bold 700
// - Extra-bold 800
// - Black 900

const weights = {
  1: "500",
  7: "600",
} as const;

// For react-native
const nativeFaces = {
  400: { normal: "Inter" },
  500: { normal: "InterMedium" },
  600: { normal: "InterSemiBold" },
  700: { normal: "InterBold" },
  // 800: { normal: "InterExtraBold" },
  // 900: { normal: "InterBlack" },
};

const letterSpacings = {} as const;

export const bodyFont = createFont({
  family: isWeb
    ? 'Inter, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    : "Inter",
  size: fontSizes,
  lineHeight: lineHeights,
  weight: weights,
  letterSpacing: letterSpacings,
  face: nativeFaces,
});
