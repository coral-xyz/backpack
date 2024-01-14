// https://github.com/tamagui/tamagui/blob/master/packages/font-inter/src/index.ts
// copied over from here but doing our own thing because we're not using their system
import { createFont, isWeb } from "@tamagui/core";

// true is required for the default font size

// the following keys are meant to match:
// - fontSize
// - lineHeight
// - letterSpacing
// - fontWeight
const size = {
  xs: 12,
  sm: 14,
  md: 16,
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

const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  base: 24,
  true: 24,
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

const weight = {
  true: "400",
  base: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  // extraBold: "800",
  // black: "900",
} as const;

// react-native has a different font system
const face = {
  400: { normal: "Inter" },
  500: { normal: "InterMedium" },
  600: { normal: "InterSemiBold" },
  700: { normal: "InterBold" },
  // 800: { normal: "InterExtraBold" },
  // 900: { normal: "InterBlack" },
};

const letterSpacing = {
  base: 0,
  true: 0,
} as const;

export const interFont = createFont({
  family: isWeb
    ? 'Inter, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    : "Inter",
  size,
  lineHeight,
  weight,
  letterSpacing,
  face,
});
