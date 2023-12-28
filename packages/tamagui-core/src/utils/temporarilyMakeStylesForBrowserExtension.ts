import { css } from "@emotion/css";

import { MUI_DARK_THEME } from "../legacyColorsHotpink";
import { darkThemeColors } from "../tokens";

const darkTheme = {
  ...darkThemeColors,
  custom: {
    colors: MUI_DARK_THEME,
  },
} as const;

type StyleObject = { [key: string]: string | number | StyleObject };
type StylesFunction<T extends StyleObject> = (theme: typeof darkTheme) => T;

export function temporarilyMakeStylesForBrowserExtension<T extends StyleObject>(
  fn: StylesFunction<T>
): () => { [K in keyof T]: string } {
  return () => {
    return Object.entries(fn(darkTheme)).reduce((acc, [key, value]) => {
      acc[key as keyof T] = css(value);
      return acc;
    }, {} as { [K in keyof T]: string });
  };
}
