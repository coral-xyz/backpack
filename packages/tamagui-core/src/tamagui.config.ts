import {
  DARK_COLORS,
  LIGHT_COLORS,
  MOBILE_DARK_OVERRIDES,
  MOBILE_LIGHT_OVERRIDES,
} from "@coral-xyz/themes";
import { config as defaultConfig } from "@tamagui/config";
import { themes as _themes } from "@tamagui/themes";
import { createTamagui, createTheme } from "tamagui";

import { interFont } from "./font-inter";
import { darkThemeColors, lightThemeColors, tokens } from "./tokens";

const darkTheme = createTheme({
  ...DARK_COLORS,
  ...MOBILE_DARK_OVERRIDES,
});

const lightTheme = createTheme({
  ...LIGHT_COLORS,
  ...MOBILE_LIGHT_OVERRIDES,
});

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  fonts: {
    body: interFont,
  },
  themes: {
    light: {
      ..._themes.light, // NOTE remove when all colors are correct
      ...createTheme(lightThemeColors),
      ...lightTheme,
    },
    dark: {
      ..._themes.dark, // NOTE remove when all colors are correct
      ...createTheme(darkThemeColors),
      ...darkTheme,
    },
  },
  media: {
    sm: { maxWidth: 650 },
    gtSm: { minWidth: 650 + 1 },
    md: { maxWidth: 850 },
    gtMd: { minWidth: 850 + 1 },
    lg: { maxWidth: 1050 },
    gtLg: { minWidth: 1050 + 1 },
    xl: { maxWidth: 1250 },
    gtXl: { minWidth: 1250 + 1 },
    xxl: { maxWidth: 1450 },
    gtXxl: { minWidth: 1450 + 1 },
  },
});

export type Conf = typeof config;

// DO NOT CHANGE THS DECLARATION, THIS MUST LOOK LIKE THIS:
// interface TamaguiCustomConfig extends Conf {}
declare module "tamagui" {
  // eslint-disable-next-line
  interface TamaguiCustomConfig extends Conf {}
}
