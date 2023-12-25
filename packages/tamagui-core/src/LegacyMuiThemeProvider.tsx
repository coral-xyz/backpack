import type { ReactNode } from "react";
// import { useMemo } from "react";

import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { createStyles, createTheme, ThemeProvider } from "@mui/material/styles";

import { HOVER_OPACITY, darkColors } from "./colorsv2";
// import { ThemeProvider as OldThemeProvider } from "@mui/styles";

const baseTheme = createStyles({
  typography: {
    fontFamily: ["Inter", "sans-serif"].join(","),
    // TODO: do we need all of these?
    fontWeight: 500,
    allVariants: {
      fontWeight: 500,
    },
    body: {
      fontWeight: 500,
    },
    p: {
      fontWeight: 500,
    },
  },
});

const darkComponentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        "&:hover": {
          opacity: HOVER_OPACITY,
        },
      },
    },
  },
  MuiButtonBase: {
    styleOverrides: {
      root: {
        "&:hover": {
          opacity: HOVER_OPACITY,
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        "&:hover": {
          opacity: HOVER_OPACITY,
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      icon: {
        color: darkColors.darkBaseIcon,
      },
    },
  },
};

const theme = createTheme({
  ...(baseTheme as any),
  components: darkComponentOverrides,
});

export const LegacyMuiThemeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <StyledEngineProvider injectFirst>
      {/* <OldThemeProvider theme={rawTheme}> */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
      {/* </OldThemeProvider> */}
    </StyledEngineProvider>
  );
};
