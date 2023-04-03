import { baseTheme } from "./base";
import {
  DARK_COLORS,
  LIGHT_COLORS,
  MOBILE_DARK_OVERRIDES,
  MOBILE_LIGHT_OVERRIDES,
} from "./colors";

export const MOBILE_LIGHT_THEME = {
  ...baseTheme,
  custom: {
    colors: {
      ...LIGHT_COLORS,
      ...MOBILE_LIGHT_OVERRIDES,
    },
  },
};

export const MOBILE_DARK_THEME = {
  ...baseTheme,
  custom: {
    colors: {
      ...DARK_COLORS,
      ...MOBILE_DARK_OVERRIDES,
    },
  },
};

export type MobileCustomTheme = typeof MOBILE_LIGHT_THEME &
  typeof MOBILE_DARK_THEME;
