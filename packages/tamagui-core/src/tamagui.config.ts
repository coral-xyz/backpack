// @ts-nocheck
// import { createAnimations } from "@tamagui/animations-react-native";
// import { createMedia } from "@tamagui/react-native-media-driver";
import {
  baseTheme,
  DARK_COLORS,
  LIGHT_COLORS,
  MOBILE_DARK_OVERRIDES,
  MOBILE_LIGHT_OVERRIDES,
} from "@coral-xyz/themes";
import { config } from "@tamagui/config";
import { createInterFont } from "@tamagui/font-inter";
import { themes as _themes, tokens as _tokens } from "@tamagui/themes";
import { createTamagui, createTheme, createTokens } from "tamagui";

const tokens = createTokens({
  ..._tokens,
  size: {
    ..._tokens.size,
    container: 48,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 36,
    "6xl": 40,
  },
  radius: {
    ..._tokens.radius,
    ...baseTheme.custom.borderRadius,
  },
});

const darkTheme = createTheme({
  ...DARK_COLORS,
  ...MOBILE_DARK_OVERRIDES,
});

const lightTheme = createTheme({
  ...LIGHT_COLORS,
  ...MOBILE_LIGHT_OVERRIDES,
});

const systemFamily =
  process.env.TAMAGUI_TARGET === "native"
    ? "Inter"
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

const bodyFont = createInterFont(
  {
    family: systemFamily,
    size: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 48,
      "6xl": 60,
    },
    lineHeight: {
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
    },
    weight: {
      1: "500",
      7: "600",
    },
  },
  {
    sizeSize: (size) => Math.round(size),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size >= 12 ? 8 : 4)),
  }
);

// @ts-ignore
export const appConfig = createTamagui({
  ...config,
  tokens,
  fonts: {
    ...config.fonts,
    body: bodyFont,
  },
  themes: {
    dark: {
      ..._themes.dark,
      ...darkTheme,
    },
    light: {
      ..._themes.light,
      ...lightTheme,
    },
  },
});

export type AppConfig = typeof appConfig;
declare module "tamagui" {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  type TamaguiCustomConfig = AppConfig;
}
