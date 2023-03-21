import { baseTheme } from "./base";
import { DARK_COLORS, LIGHT_COLORS } from "./colors";

export const MOBILE_LIGHT_THEME = {
  ...baseTheme,
  custom: {
    colors: LIGHT_COLORS,
  },
};

export const MOBILE_DARK_THEME = {
  ...baseTheme,
  custom: {
    colors: DARK_COLORS,
  },
};

export type CustomTheme = typeof MOBILE_LIGHT_THEME & typeof MOBILE_DARK_THEME;
