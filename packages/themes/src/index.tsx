import _makeStyles from "@mui/styles/makeStyles";
import useTheme from "@mui/styles/useTheme";
import createStyles from "@mui/styles/createStyles";

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

const BACKGROUND_COLOR_0 = "#18181b";
const BACKGROUND_COLOR_1 = "#27272a";
const BACKGROUND_COLOR_2 = "#3F3F46";
const FONT_COLOR = "#FFFFFF";
const FONT_COLOR_1 = "#71717A";
const FONT_COLOR_2 = "#D4D4D8";
const BRAND_COLOR = "#14B8A6";
const BUTTON_FONT_COLOR = FONT_COLOR;
const BORDER_COLOR = "#393C43";
const BORDER_COLOR_1 = "#52525B";

export const darkTheme: any = {
  ...baseTheme,
  custom: {
    colors: {
      background: BACKGROUND_COLOR_0,
      nav: BACKGROUND_COLOR_1,
      fontColor: FONT_COLOR,
      border: BORDER_COLOR,
      activeNavButton: BRAND_COLOR,
      hamburger: FONT_COLOR_1,
      scrollbarTrack: BACKGROUND_COLOR_0,
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: FONT_COLOR_1,
      tabIconSelected: BRAND_COLOR,
      secondary: FONT_COLOR_1,
      positive: "#35A63A",
      negative: "#E95050",
      primaryButton: BRAND_COLOR,
      secondaryButton: BACKGROUND_COLOR_2,
      dangerButton: "#DC2626",
      buttonFontColor: BUTTON_FONT_COLOR,
      sendGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_0} 0%, rgba(27, 29, 35, 0) 100%)`,
      swapGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      interactiveIconsActive: BRAND_COLOR,
      interactiveIconsHover: "#67758B",
      drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      alpha: FONT_COLOR_2,
      bg2: BACKGROUND_COLOR_2,
      border1: BORDER_COLOR_1,
    },
  },
};

export const lightTheme: any = {
  ...baseTheme,
  custom: {
    colors: {
      ...darkTheme.custom.colors,
      background: "#ECEFF3",
      nav: "#ffffff",
      fontColor: "#43546D",
      border: "#DBDADB",
      activeNavButton: "#00A2C7",
      hamburger: "#99A4B4",
      scrollbarTrack: "#ECEFF3",
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: "#99A4B4",
      tabIconSelected: "#1196B5",
      secondary: "#67758B",
      positive: "#19A51E",
      negative: "#E31B1B",
      primaryButton: BRAND_COLOR,
      secondaryButton: "#292C33",
      dangerButton: "#DC2626",
      sendGradient:
        "linear-gradient(180deg, #1B1D23 0%, rgba(27, 29, 35, 0) 100%)", // todo
      interactiveIconsActive: "#1196B5",
      bg2: BACKGROUND_COLOR_2,
      border1: BORDER_COLOR_1,
    },
  },
};

type CustomTheme = typeof lightTheme & typeof darkTheme;

export const styles = _makeStyles<CustomTheme>;

export const useCustomTheme = useTheme<CustomTheme>;
