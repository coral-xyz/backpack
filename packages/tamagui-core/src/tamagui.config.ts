// import { createAnimations } from "@tamagui/animations-react-native";
// import { createMedia } from "@tamagui/react-native-media-driver";
import {
  baseTheme,
  DARK_COLORS,
  LIGHT_COLORS,
  MOBILE_DARK_OVERRIDES,
  MOBILE_LIGHT_OVERRIDES,
} from "@coral-xyz/themes";
import { config } from "@tamagui/config";
// import { createInterFont } from "@tamagui/font-inter";
import { themes as _themes, tokens as _tokens } from "@tamagui/themes";
import { createTamagui, createTheme, createTokens } from "tamagui";

const tokens = createTokens({
  ..._tokens,
  size: {
    ..._tokens.size,
    container: 48,
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
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  type TamaguiCustomConfig = AppConfig;
}
