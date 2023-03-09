import { useDarkMode } from "@coral-xyz/recoil";

import { darkTheme, lightTheme } from "../theme";

export function useCustomTheme() {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return {
    custom: theme.custom,
    colorScheme: isDarkMode ? "dark" : "light",
  };
}
