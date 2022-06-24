import { ThemeProvider } from "@mui/styles";
import { darkTheme, lightTheme } from "@coral-xyz/themes";
import { useDarkMode } from "@coral-xyz/recoil";
import { CssBaseline, StyledEngineProvider } from "@mui/material";

export function WithTheme(props: any) {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {props.children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
