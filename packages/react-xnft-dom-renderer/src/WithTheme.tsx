import { useMemo, Suspense } from "react";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ThemeProvider as OldThemeProvider } from "@mui/styles";
import { darkTheme, lightTheme } from "@coral-xyz/themes";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "@coral-xyz/common";
import { useDomContext } from "./Context";

export const WithTheme: React.FC = ({ children }) => {
  return (
    <Suspense fallback={<BlankNoTheme />}>
      <WithThemeInner>{children}</WithThemeInner>
    </Suspense>
  );
};

const WithThemeInner: React.FC = ({ children }) => {
  const { metadata } = useDomContext();
  const isDarkMode = metadata.isDarkMode;

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
          {children}
        </ThemeProvider>
      </OldThemeProvider>
    </StyledEngineProvider>
  );
};

// Used as a suspense fallback when loading the theme from the background.
const BlankNoTheme: React.FC = () => {
  return (
    <div
      style={{
        minWidth: `${EXTENSION_WIDTH}px`,
        minHeight: `${EXTENSION_HEIGHT}px`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
};
