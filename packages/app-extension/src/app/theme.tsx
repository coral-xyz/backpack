import { useMemo } from "react";
import { darkTheme, lightTheme } from "@coral-xyz/themes";
import { useDarkMode } from "@coral-xyz/recoil";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ThemeProvider as OldThemeProvider } from "@mui/styles";

export function WithTheme(props: any) {
  const isDarkMode = useDarkMode();
  const [theme, rawTheme] = useMemo(() => {
    const rawTheme = isDarkMode ? darkTheme : lightTheme;
    const theme = createTheme(rawTheme as any, { custom: rawTheme.custom });
    return [theme, rawTheme];
  }, [isDarkMode]);
  return (
    <StyledEngineProvider injectFirst>
      <OldThemeProvider theme={rawTheme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {props.children}
        </ThemeProvider>
      </OldThemeProvider>
    </StyledEngineProvider>
  );
}
