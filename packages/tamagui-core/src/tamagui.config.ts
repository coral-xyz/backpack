import {
  DARK_COLORS,
  LIGHT_COLORS,
  MOBILE_DARK_OVERRIDES,
  MOBILE_LIGHT_OVERRIDES,
} from "@coral-xyz/themes";
import { config as defaultConfig } from "@tamagui/config";
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
      ...createTheme(lightThemeColors),
      ...lightTheme,
    },
    dark: {
      ...createTheme(darkThemeColors),
      ...darkTheme,
    },
  },
});

export type Conf = typeof config;

// DO NOT CHANGE THS DECLARATION, THIS MUST LOOK LIKE THIS:
// interface TamaguiCustomConfig extends Conf {}
declare module "tamagui" {
  // eslint-disable-next-line
  interface TamaguiCustomConfig extends Conf {}
}
