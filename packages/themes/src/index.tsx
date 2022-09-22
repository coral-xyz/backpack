import _makeStyles from "@mui/styles/makeStyles";
import useTheme from "@mui/styles/useTheme";
import createStyles from "@mui/styles/createStyles";

export const HOVER_OPACITY = 0.8;

const BACKGROUND_COLOR_0 = "#18181b";
const BACKGROUND_BACKDROP_COLOR = BACKGROUND_COLOR_0;
const BACKGROUND_COLOR_1 = "#27272a";
const BACKGROUND_COLOR_2 = "#3F3F46";
const FONT_COLOR = "#FFFFFF";
const FONT_COLOR_1 = "#71717A";
const FONT_COLOR_2 = "#D4D4D8";
const FONT_COLOR_3 = "#A1A1AA";
const BRAND_COLOR = "#FFFFFF";
const BUTTON_FONT_COLOR = FONT_COLOR;
const BORDER_COLOR = "#393C43";
const BORDER_COLOR_1 = "#52525B";
const POSITIVE_COLOR = "#35A63A";
const NEGATIVE_COLOR = "#E95050";
const SCROLLBAR_THUMB_COLOR = "rgb(153 164 180)";

const LIGHT_BACKGROUND_BACKDROP_COLOR =
  "linear-gradient(180deg, #FFFFFF 0%, #F0F0F2 100%)";
const LIGHT_BACKGROUND_COLOR_0 = "#F0F0F2";
const LIGHT_BACKGROUND_COLOR_1 = "#ffffff";
const LIGHT_BACKGROUND_COLOR_2 = LIGHT_BACKGROUND_COLOR_0;
const LIGHT_FONT_COLOR = "#212938";
const LIGHT_FONT_COLOR_1 = "#67758B";
const LIGHT_FONT_COLOR_2 = LIGHT_FONT_COLOR;
const LIGHT_FONT_COLOR_3 = LIGHT_FONT_COLOR_1;
const LIGHT_BRAND_COLOR = LIGHT_FONT_COLOR;
const LIGHT_BUTTON_FONT_COLOR = FONT_COLOR;
const LIGHT_BORDER_COLOR = "#F0F0F2";
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
      brandColor: BRAND_COLOR,
      background: BACKGROUND_COLOR_0,
      backgroundBackdrop: BACKGROUND_BACKDROP_COLOR,
      bg2: BACKGROUND_COLOR_2,
      nav: BACKGROUND_COLOR_1,
      fontColor: FONT_COLOR,
      fontColor2: FONT_COLOR_2,
      fontColor3: FONT_COLOR_3,
      subtext: FONT_COLOR_3,
      secondary: FONT_COLOR_1,
      primaryButton: BRAND_COLOR,
      primaryButtonTextColor: BACKGROUND_COLOR_1,
      secondaryButton: BACKGROUND_COLOR_2,
      secondaryButtonTextColor: FONT_COLOR,
      buttonFontColor: BUTTON_FONT_COLOR,
      border1: BACKGROUND_COLOR_2,
      border: BACKGROUND_COLOR_1, // Don't use this.
      borderColor: BORDER_COLOR,
      textFieldTextColor: FONT_COLOR_2,
      copyTooltipColor: BRAND_COLOR,
      copyTooltipTextColor: BACKGROUND_COLOR_1,
      tableBorder: BACKGROUND_COLOR_0,
      balanceSkeleton: BACKGROUND_COLOR_1,
      balanceChangeNegative: "rgb(233, 80, 80, .1)",
      balanceChangePositive: "rgb(53, 166, 58, .1)",

      dangerButton: DANGER_COLOR,
      alpha: FONT_COLOR_2,
      scrollbarTrack: BACKGROUND_COLOR_0,
      scrollbarThumb: SCROLLBAR_THUMB_COLOR,
      positive: POSITIVE_COLOR,
      negative: NEGATIVE_COLOR,
      negativeButtonTextColor: "#fff",
      drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
      tabBarBoxShadow: "0px -2px 6px rgba(0, 0, 0, 0.05)",
      coralGradient:
        "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
    },
  },
};

export const lightTheme: any = {
  ...baseTheme,
  components: componentOverrides,
  custom: {
    colors: {
      brandColor: LIGHT_BRAND_COLOR,
      backgroundBackdrop: LIGHT_BACKGROUND_BACKDROP_COLOR,
      background: LIGHT_BACKGROUND_COLOR_0,
      nav: LIGHT_BACKGROUND_COLOR_1,
      bg2: LIGHT_BACKGROUND_COLOR_2,
      fontColor: LIGHT_FONT_COLOR,
      fontColor2: LIGHT_FONT_COLOR_2,
      fontColor3: LIGHT_FONT_COLOR_3,
      subtext: LIGHT_FONT_COLOR_3,
      secondary: LIGHT_FONT_COLOR_1,
      primaryButton: LIGHT_BRAND_COLOR,
      primaryButtonTextColor: LIGHT_BACKGROUND_COLOR_1,
      secondaryButton: LIGHT_BACKGROUND_COLOR_1,
      secondaryButtonTextColor: LIGHT_FONT_COLOR,
      buttonFontColor: LIGHT_BUTTON_FONT_COLOR,
      border: LIGHT_BACKGROUND_COLOR_1,
      border1: LIGHT_BORDER_COLOR_1,
      borderColor: LIGHT_BORDER_COLOR_1,
      copyTooltipColor: LIGHT_BRAND_COLOR,
      copyTooltipTextColor: LIGHT_BACKGROUND_COLOR_1,
      tableBorder: LIGHT_BORDER_COLOR,
      balanceSkeleton: "rgba(0,0,0,0.15)",
      balanceChangeNegative: "rgb(233, 80, 80, .1)",
      balanceChangePositive: "rgb(53, 166, 58, .1)",

      dangerButton: DANGER_COLOR,
      alpha: LIGHT_FONT_COLOR,
      scrollbarTrack: LIGHT_BACKGROUND_COLOR_0,
      scrollbarThumb: LIGHT_SCROLLBAR_THUMB_COLOR,
      positive: LIGHT_POSITIVE_COLOR,
      negative: LIGHT_NEGATIVE_COLOR,
      negativeButtonTextColor: "#fff",
      drawerGradient: `linear-gradient(180deg, ${LIGHT_BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
      tabBarBoxShadow: "0px -2px 6px rgba(0, 0, 0, 0.05)",
      coralGradient:
        "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
    },
  },
};

export type CustomTheme = typeof lightTheme & typeof darkTheme;
export const styles = _makeStyles<CustomTheme>;
export const useCustomTheme = useTheme<CustomTheme>;
