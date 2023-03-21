import { baseTheme } from "./base";
import { DARK_COLORS, LIGHT_COLORS } from "./colors";

export const darkTheme = {
  ...baseTheme,
  custom: {
    colors: LIGHT_COLORS,
  },
};

export const lightTheme = {
  ...baseTheme,
  custom: {
    colors: DARK_COLORS,
  },
};

export type CustomTheme = typeof lightTheme & typeof darkTheme;
