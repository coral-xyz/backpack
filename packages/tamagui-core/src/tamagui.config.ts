// import { createAnimations } from "@tamagui/animations-react-native";
// import { createInterFont } from "@tamagui/font-inter";
// import { createMedia } from "@tamagui/react-native-media-driver";
import { config } from "@tamagui/config";
// import { tokens as tTokens } from "@tamagui/theme-base";
import { themes, tokens as tTokens } from "@tamagui/themes";
import { createTamagui, createTheme, createTokens } from "tamagui";

import * as BackpackTheme from "./theme";

const tokens = createTokens({
  ...tTokens,
  size: {
    ...tTokens.size,
    input: 48,
  },
  radius: {
    ...tTokens.radius,
    ...BackpackTheme.baseTheme.borderRadius,
  },
});

export const darkTheme = createTheme({
  ...BackpackTheme.darkTheme.custom.colors,
});

export const lightTheme = createTheme({
  ...BackpackTheme.lightTheme.custom.colors,
});

const allThemes = {
  dark: darkTheme,
  light: lightTheme,
};

type BaseTheme = typeof lightTheme;
type ThemeName = keyof typeof allThemes;

type Themes = {
  [key in ThemeName]: BaseTheme;
};

// export const themes: Themes = allThemes;

export const appConfig = createTamagui({ ...config, themes, tokens });

export type AppConfig = typeof appConfig;
declare module "tamagui" {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  type TamaguiCustomConfig = AppConfig;
}
