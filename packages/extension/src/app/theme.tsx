import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useDarkMode } from "@coral-xyz/recoil";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const BRAND_COLOR = "#14B8A6";
const ERROR_COLOR = "#DC2626";
const SECONDARY_COLOR = "#292C33";

const components = {
  MuiButton: {
    defaultProps: {
      disableRipple: true,
      disableElevation: true,
      // variant: "contained" as const,
    },
    styleOverrides: {
      root: ({ ownerState, theme }: { ownerState: any; theme: any }) => ({
        ...(ownerState.color === "primary" && {
          backgroundColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
          },
        }),
        ...(ownerState.color === "error" && {
          backgroundColor: theme.palette.error.main,
          "&:hover": {
            backgroundColor: theme.palette.error.main,
          },
        }),
        ...(ownerState.color === "secondary" && {
          backgroundColor: theme.palette.secondary.main,
          "&:hover": {
            backgroundColor: theme.palette.secondary.main,
          },
        }),
        width: "100%",
        height: "48px",
        borderRadius: "12px",
        "&.Mui-disabled": {
          opacity: 0.5,
        },
      }),
      text: ({ theme }: { theme: any }) => ({
        color: theme.custom.colors.buttonFontColor,
        fontWeight: 500,
        fontSize: "16px",
        lineHeight: "24px",
        textTransform: "none" as const,
      }),
    },
  },
  MuiCheckbox: {},
};

export const lightTheme = createTheme({
  components,
  palette: {
    primary: {
      main: BRAND_COLOR,
    },
    error: {
      main: ERROR_COLOR,
    },
    secondary: {
      main: SECONDARY_COLOR,
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  // @ts-ignore
  custom: {
    colors: {
      background: "#ECEFF3",
      nav: "#ffffff",
      fontColor: "#43546D",
      border: "#DBDADB",
      activeNavButton: "#00A2C7",
      hamburger: "#99A4B4",
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: "#99A4B4",
      tabIconSelected: "#1196B5",
      secondary: "#67758B",
      positive: "#19A51E",
      negative: "#E31B1B",
      sendGradient:
        "linear-gradient(180deg, #1B1D23 0%, rgba(27, 29, 35, 0) 100%)", // todo
      interactiveIconsActive: "#1196B5",
    },
  },
});

const BACKGROUND_COLOR_0 = "#18181b";
const BACKGROUND_COLOR_1 = "#27272a";
const FONT_COLOR = "#FFFFFF";
const FONT_COLOR_1 = "#71717A";
const FONT_COLOR_2 = "#D4D4D8";
const BUTTON_FONT_COLOR = FONT_COLOR;
const BORDER_COLOR = "#393C43";

export const darkTheme = createTheme({
  components,
  palette: {
    primary: {
      main: BRAND_COLOR,
    },
    error: {
      main: ERROR_COLOR,
    },
    secondary: {
      main: SECONDARY_COLOR,
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  // @ts-ignore
  custom: {
    colors: {
      background: BACKGROUND_COLOR_0,
      nav: BACKGROUND_COLOR_1,
      fontColor: FONT_COLOR,
      border: BORDER_COLOR,
      activeNavButton: BRAND_COLOR,
      hamburger: FONT_COLOR_1,
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: FONT_COLOR_1,
      tabIconSelected: BRAND_COLOR,
      secondary: FONT_COLOR_1,
      positive: "#35A63A",
      negative: "#E95050",
      buttonFontColor: BUTTON_FONT_COLOR,
      sendGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_0} 0%, rgba(27, 29, 35, 0) 100%)`,
      swapGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      interactiveIconsActive: BRAND_COLOR,
      interactiveIconsHover: "#67758B",
      drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      alpha: FONT_COLOR_2,
    },
  },
});

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
