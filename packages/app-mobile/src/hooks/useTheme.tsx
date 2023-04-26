// import { useDarkMode } from "@coral-xyz/recoil";
import { useColorScheme } from "react-native";

import { MOBILE_DARK_THEME, MOBILE_LIGHT_THEME } from "@coral-xyz/themes";

export function useTheme() {
  // const isDarkMode = useDarkMode();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MOBILE_DARK_THEME : MOBILE_LIGHT_THEME;

  return {
    custom: theme.custom,
    colorScheme,
  };
}
