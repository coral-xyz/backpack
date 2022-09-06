import _makeStyles from "@mui/styles/makeStyles";
import useTheme from "@mui/styles/useTheme";
import createStyles from "@mui/styles/createStyles";

export const HOVER_OPACITY = 0.8;

const BACKGROUND_COLOR_0 = "#18181b";
const BACKGROUND_COLOR_1 = "#27272a";
const BACKGROUND_COLOR_2 = "#3F3F46";
const FONT_COLOR = "#FFFFFF";
const FONT_COLOR_1 = "#71717A";
const FONT_COLOR_2 = "#D4D4D8";
const FONT_COLOR_3 = "#A1A1AA";
const BRAND_COLOR = "#47dfbe";
const BUTTON_FONT_COLOR = FONT_COLOR;
const BORDER_COLOR = "#393C43";
const BORDER_COLOR_1 = "#52525B";
const POSITIVE_COLOR = "#35A63A";
const NEGATIVE_COLOR = "#E95050";
const SCROLLBAR_THUMB_COLOR = "rgb(153 164 180)";

const LIGHT_BACKGROUND_COLOR_0 = "#ECEFF3";
const LIGHT_BACKGROUND_COLOR_1 = "#ffffff";
const LIGHT_BACKGROUND_COLOR_2 = LIGHT_BACKGROUND_COLOR_0;
const LIGHT_FONT_COLOR = "#43546D";
const LIGHT_FONT_COLOR_1 = "#67758B";
const LIGHT_FONT_COLOR_2 = "#D4D4D8";
const LIGHT_FONT_COLOR_3 = LIGHT_FONT_COLOR_1;
const LIGHT_BRAND_COLOR = BRAND_COLOR;
const LIGHT_BUTTON_FONT_COLOR = FONT_COLOR;
const LIGHT_BORDER_COLOR = "#DBDADB";
const LIGHT_BORDER_COLOR_1 = "#DBDADB";
const LIGHT_POSITIVE_COLOR = POSITIVE_COLOR;
const LIGHT_NEGATIVE_COLOR = NEGATIVE_COLOR;
const LIGHT_SCROLLBAR_THUMB_COLOR = SCROLLBAR_THUMB_COLOR;

const DANGER_COLOR = "#DC2626";

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

const componentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        "&:hover": {
          opacity: HOVER_OPACITY,
        },
      },
    },
  },
  MuiListItem: {
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
        color: FONT_COLOR_1,
      },
    },
  },
};

export const darkTheme: any = {
  ...baseTheme,
  components: componentOverrides,
  custom: {
    colors: {
      background: BACKGROUND_COLOR_0,
      nav: BACKGROUND_COLOR_1,
      fontColor: FONT_COLOR,
      fontColor2: FONT_COLOR_2,
      fontColor3: FONT_COLOR_3,
      border: BORDER_COLOR,
      brandColor: BRAND_COLOR,
      activeNavButton: BRAND_COLOR,
      scrollbarTrack: BACKGROUND_COLOR_0,
      scrollbarThumb: SCROLLBAR_THUMB_COLOR,
      secondary: FONT_COLOR_1,
      positive: POSITIVE_COLOR,
      negative: NEGATIVE_COLOR,
      primaryButton: BRAND_COLOR,
      secondaryButton: BACKGROUND_COLOR_2,
      dangerButton: DANGER_COLOR,
      buttonFontColor: BUTTON_FONT_COLOR,
      alpha: FONT_COLOR_2,
      bg2: BACKGROUND_COLOR_2,
      border1: BORDER_COLOR_1,
      subtext: FONT_COLOR_3,
      drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
    },
  },
};

export const lightTheme: any = {
  ...baseTheme,
  components: componentOverrides,
  custom: {
    colors: {
      background: LIGHT_BACKGROUND_COLOR_0,
      nav: LIGHT_BACKGROUND_COLOR_1,
      fontColor: LIGHT_FONT_COLOR,
      fontColor2: LIGHT_FONT_COLOR_2,
      fontColor3: LIGHT_FONT_COLOR_3,
      border: LIGHT_BORDER_COLOR,
      activeNavButton: LIGHT_BRAND_COLOR,
      brandColor: LIGHT_BRAND_COLOR,
      scrollbarTrack: LIGHT_BACKGROUND_COLOR_0,
      scrollbarThumb: LIGHT_SCROLLBAR_THUMB_COLOR,
      secondary: LIGHT_FONT_COLOR_1,
      positive: LIGHT_POSITIVE_COLOR,
      negative: LIGHT_NEGATIVE_COLOR,
      primaryButton: LIGHT_BRAND_COLOR,
      secondaryButton: LIGHT_BACKGROUND_COLOR_2,
      dangerButton: DANGER_COLOR,
      buttonFontColor: LIGHT_BUTTON_FONT_COLOR,
      alpha: LIGHT_FONT_COLOR,
      bg2: LIGHT_BACKGROUND_COLOR_2,
      border1: LIGHT_BORDER_COLOR_1,
      subtext: LIGHT_FONT_COLOR_3,
      drawerGradient: `linear-gradient(180deg, ${LIGHT_BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
    },
  },
};

export type CustomTheme = typeof lightTheme & typeof darkTheme;
export const styles = _makeStyles<CustomTheme>;
export const useCustomTheme = useTheme<CustomTheme>;
