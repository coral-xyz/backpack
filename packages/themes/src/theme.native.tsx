// Native only for now. Will rename to theme.native.tsx but webpack/app-extension didn't like that
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

export type CustomTheme = typeof MOBILE_LIGHT_THEME & typeof MOBILE_DARK_THEME;
