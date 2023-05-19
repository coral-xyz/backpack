import {
  DARK_COLORS,
  LIGHT_COLORS,
  MOBILE_DARK_OVERRIDES,
  MOBILE_LIGHT_OVERRIDES,
} from "@coral-xyz/themes";
import { config as defaultConfig } from "@tamagui/config";
import { createTamagui, createTheme } from "tamagui";

import { dark, light } from "./colors";
import { interFont } from "./font-inter";
import { tokens } from "./tokens";

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
      ...createTheme(light),
      ...lightTheme,
    },
    dark: {
      ...createTheme(dark),
      ...darkTheme,
    },
  },
});
