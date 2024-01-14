import { Platform } from "react-native";

import * as Linking from "expo-linking";

import { darkColors } from "../colorsv2";

export const openUrl: (
  url: string,
  target?: string | undefined,
  windowFeatures?: string | undefined
) => Promise<true> = Platform.select({
  native: Linking.openURL,
  web: async (
    url: string,
    target?: string | undefined,
    windowFeatures?: string | undefined
  ): Promise<true> => {
    // eslint-disable-next-line no-restricted-properties
    window.open(url, target, windowFeatures);
    return true;
  },
})!;

export function getAvatarColorFromIndex(index: number): string {
  const idx = (index % 14) + 1;

  const colors = darkColors;
  const prefix = "darkUser";

  const userLabel = `${prefix}${idx < 10 ? "0" : ""}${idx}`;

  // @ts-ignore
  const c = colors[userLabel];
  return c;
}

export { temporarilyMakeStylesForBrowserExtension } from "./temporarilyMakeStylesForBrowserExtension";
