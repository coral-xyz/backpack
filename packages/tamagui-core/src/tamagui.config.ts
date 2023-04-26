import {
  baseTheme,
  DARK_COLORS,
  LIGHT_COLORS,
  MOBILE_DARK_OVERRIDES,
  MOBILE_LIGHT_OVERRIDES,
} from "@coral-xyz/themes";
import { config } from "@tamagui/config";
import { themes as _themes, tokens as _tokens } from "@tamagui/themes";
import { createTamagui, createTheme, createTokens } from "tamagui";

import { bodyFont } from "./fonts";

const tokens = createTokens({
  ..._tokens,
  size: {
    ..._tokens.size,
    container: 48,
    borderWidth: 2,
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
  type TamaguiCustomConfig = AppConfig;
}
