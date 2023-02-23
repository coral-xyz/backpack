import createStyles from "@mui/styles/createStyles";
import _makeStyles from "@mui/styles/makeStyles";
import useTheme from "@mui/styles/useTheme";
import type { CreateMUIStyled, Theme } from "@mui/system";
import muiStyled from "@mui/system/styled";

export const HOVER_OPACITY = 0.8;

export const TEXT_COLOR = "#fff";
const BACKGROUND_COLOR_0 = "#18181b";
export const BACKGROUND_BACKDROP_COLOR = BACKGROUND_COLOR_0;
export const BACKGROUND_COLOR_1 = "#27272a";
const BACKGROUND_COLOR_2 = "#3F3F46";
const FONT_COLOR = "#FFFFFF";
const FONT_COLOR_1 = "#71717A";
export const FONT_COLOR_2 = "#D4D4D8";
const FONT_COLOR_3 = "#A1A1AA";
const BRAND_COLOR = "#FFFFFF";
const BUTTON_FONT_COLOR = FONT_COLOR;
const BORDER_COLOR = "#393C43";
const POSITIVE_COLOR = "#35A63A";
const NEGATIVE_COLOR = "#E95050";
const SCROLLBAR_THUMB_COLOR = "rgb(153 164 180)";
const LIGHT_TEXT_SMALL_COLOR = "#4E5768";
const DARK_TEXT_SMALL_COLOR = "#8F929E";

const NEGATIVE_LIGHT = "#FFF4F3";
const NEGATIVE_DARK = "#FFF4F3";

export const LIGHT_TEXT_COLOR = FONT_COLOR_1;
export const LIGHT_BACKGROUND_BACKDROP_COLOR =
  "linear-gradient(180deg, #F8F8F9 0%, #F0F0F2 100%), #FFFFFF";
const LIGHT_BACKGROUND_COLOR_0 = "#F0F0F2";
export const LIGHT_BACKGROUND_COLOR_1 = "#ffffff";
const LIGHT_BACKGROUND_COLOR_2 = LIGHT_BACKGROUND_COLOR_0;
const LIGHT_FONT_COLOR = "#030A19";
const LIGHT_FONT_COLOR_1 = "#4E5768";
export const LIGHT_FONT_COLOR_2 = LIGHT_FONT_COLOR;
const LIGHT_FONT_COLOR_3 = LIGHT_FONT_COLOR_1;
const LIGHT_BRAND_COLOR = LIGHT_FONT_COLOR;
const LIGHT_BUTTON_FONT_COLOR = FONT_COLOR;
const LIGHT_BORDER_COLOR = "#DFE0E6";
const LIGHT_BORDER_COLOR_1 = "#F0F0F2";
const LIGHT_POSITIVE_COLOR = POSITIVE_COLOR;
const LIGHT_NEGATIVE_COLOR = NEGATIVE_COLOR;
const LIGHT_SCROLLBAR_THUMB_COLOR = SCROLLBAR_THUMB_COLOR;
const LIGHT_ICON_HOVER_COLOR = "#787C89";
const LIGHT_UNREAD_BACKGROUND = "rgba(99, 96, 255, 0.1)";
const DARK_UNREAD_BACKGROUND = "rgba(99, 96, 255, 0.1)";

const DANGER_COLOR = "#DC2626";
const DANGER_DARK_COLOR = "#DC2626";

// Migration to colours from Figma design system
export const LIGHT_RED_BORDER_LIGHT = "#FFEDEB";
export const LIGHT_RED_BORDER_MED = "#FFDCD9";
export const DARK_RED_BORDER_LIGHT = "rgba(241,50,54,0.4)";
export const DARK_RED_BORDER_MED = "rgba(241,50,54,0.4)";

type CustomColors = {
  smallTextColor: string;
  brandColor: string;
  backgroundBackdrop: string;
  successButton: string;
  background: string;
  nav: string;
  bg2: string;
  bg3: string;
  bg4: string;
  invertedBg4: string;
  banner: string;
  fontColor: string;
  fontColor2: string;
  fontColor3: string;
  fontColor4: string;
  subtext: string;
  blue: string;
  secondary: string;
  primaryButton: string;
  primaryButtonTextColor: string;
  secondaryButton: string;
  secondaryButtonTextColor: string;
  buttonFontColor: string;
  textInputBackground: string;
  textInputBorderFull: string;
  textInputBorderFocussed: string;
  textInputBorderHovered: string;
  border: string;
  border1: string;
  borderColor: string;
  borderFull: string;
  borderButton: string;
  borderRedLight: string;
  borderRedMed: string;
  copyTooltipColor: string;
  copyTooltipTextColor: string;
  tableBorder: string;
  balanceSkeleton: string;
  balanceChangeNegative: string;
  balanceChangePositive: string;
  balanceChangeNeutral: string;
  textBackground: string;
  textBorder: string;
  textPlaceholder: string;
  swapTokensButton: string;
  icon: string;
  approveTransactionTableBackground: string;
  approveTransactionCloseBackground: string;
  hoverIconBackground: string;
  avatarIconBackground: string;
  text: string;
  textFieldTextColor: string;
  dangerButton: string;
  alpha: string;
  scrollbarTrack: string;
  scrollbarThumb: string;
  positive: string;
  negative: string;
  negativeBackground: string;
  neutral: string;
  negativeButtonTextColor: string;
  drawerGradient: string;
  boxShadow: string;
  tabBarBoxShadow: string;
  coralGradient: string;
  miniDrawerBackdrop: string;
  unreadBackground: string;
  invertedPrimary: string;
  invertedSecondary: string;
  invertedTertiary: string;
  avatarPopoverMenuBackground: string;
  listItemHover: string;
  walletCopyButtonHover: string;
  verified: string;
  chatFadeGradient: string;
  chatFadeGradientStart: string;
  linkColor: string;
};

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
        color: FONT_COLOR_1,
      },
    },
  },
};

const DARK_COLORS: CustomColors = {
  blue: "#3498db",
  smallTextColor: DARK_TEXT_SMALL_COLOR,
  brandColor: BRAND_COLOR,
  background: BACKGROUND_COLOR_0,
  backgroundBackdrop: BACKGROUND_BACKDROP_COLOR,
  banner: BACKGROUND_COLOR_1,
  bg2: BACKGROUND_COLOR_2,
  bg3: BACKGROUND_COLOR_0,
  bg4: "rgba(255, 255, 255, 0.2)",
  invertedBg4: LIGHT_BACKGROUND_COLOR_0,
  nav: BACKGROUND_COLOR_1,
  fontColor: FONT_COLOR,
  fontColor2: FONT_COLOR_2,
  fontColor3: FONT_COLOR_3,
  fontColor4: LIGHT_BACKGROUND_COLOR_1,
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
  borderRedLight: DARK_RED_BORDER_LIGHT,
  borderRedMed: DARK_RED_BORDER_MED,
  textInputBackground: BACKGROUND_COLOR_1,
  textInputBorderFull: `solid 2pt ${BACKGROUND_COLOR_1}`,
  textInputBorderFocussed: `solid 2pt ${BACKGROUND_COLOR_1}`,
  textInputBorderHovered: `solid 2pt ${BACKGROUND_COLOR_1}`,
  borderFull: `solid 2px ${BACKGROUND_COLOR_1}`,
  borderButton: `solid 2px ${BACKGROUND_COLOR_1}`,
  textFieldTextColor: FONT_COLOR_2,
  copyTooltipColor: BRAND_COLOR,
  copyTooltipTextColor: BACKGROUND_COLOR_1,
  tableBorder: BACKGROUND_COLOR_0,
  balanceSkeleton: BACKGROUND_COLOR_1,
  balanceChangeNegative: "rgb(233, 80, 80, .1)",
  balanceChangePositive: "rgb(53, 166, 58, .1)",
  balanceChangeNeutral: "rgb(78, 87, 104, .1)",
  textBackground: BACKGROUND_COLOR_1,
  textPlaceholder: FONT_COLOR_1,
  textBorder: BACKGROUND_COLOR_1,
  swapTokensButton: BACKGROUND_COLOR_0,
  icon: "#787C89",
  approveTransactionTableBackground: BACKGROUND_COLOR_2,
  approveTransactionCloseBackground: BACKGROUND_COLOR_0,
  hoverIconBackground: `rgb(39, 39, 42, ${HOVER_OPACITY})`,
  avatarIconBackground: "#DFE0E5",
  text: TEXT_COLOR,
  dangerButton: DANGER_DARK_COLOR,
  successButton: "#2ecc71",
  alpha: "#8F929E",
  scrollbarTrack: BACKGROUND_COLOR_0,
  scrollbarThumb: SCROLLBAR_THUMB_COLOR,
  positive: POSITIVE_COLOR,
  negative: NEGATIVE_COLOR,
  negativeBackground: NEGATIVE_DARK,
  neutral: "rgb(78, 87, 104)",
  negativeButtonTextColor: "#fff",
  drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
  boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
  tabBarBoxShadow: "0px -4px 4px rgba(3, 10, 25, 0.02)",
  coralGradient:
    "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
  miniDrawerBackdrop: "#000000",
  unreadBackground: LIGHT_UNREAD_BACKGROUND,
  invertedPrimary: "#FFFFFF",
  invertedSecondary: LIGHT_BACKGROUND_COLOR_0,
  invertedTertiary: "white",
  avatarPopoverMenuBackground: BACKGROUND_COLOR_0,
  listItemHover: `rgba(39, 39, 42, ${HOVER_OPACITY})`,
  walletCopyButtonHover: "#18181c",
  verified: "#DFE0E5",
  chatFadeGradientStart: "rgba(255, 255, 255, 0.04)",
  chatFadeGradient:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 20%, rgba(0, 0, 0, 0) 100%), #18181B",
  linkColor: "#4C94FF",
};

const LIGHT_COLORS: CustomColors = {
  blue: "blue",
  smallTextColor: LIGHT_TEXT_SMALL_COLOR,
  brandColor: LIGHT_BRAND_COLOR,
  backgroundBackdrop: LIGHT_BACKGROUND_BACKDROP_COLOR,
  banner: LIGHT_BACKGROUND_BACKDROP_COLOR,
  background: LIGHT_BACKGROUND_COLOR_0,
  nav: LIGHT_BACKGROUND_COLOR_1,
  bg2: LIGHT_BACKGROUND_COLOR_2,
  bg3: LIGHT_BACKGROUND_COLOR_1,
  bg4: LIGHT_BACKGROUND_COLOR_0,
  invertedBg4: "rgba(255, 255, 255, 0.2)",
  fontColor: LIGHT_FONT_COLOR,
  successButton: "#2ecc71",
  fontColor2: LIGHT_FONT_COLOR_2,
  fontColor3: LIGHT_FONT_COLOR_3,
  fontColor4: LIGHT_FONT_COLOR_2,
  subtext: LIGHT_FONT_COLOR_3,
  secondary: LIGHT_FONT_COLOR_1,
  textInputBackground: LIGHT_BACKGROUND_COLOR_0,
  primaryButton: LIGHT_BRAND_COLOR,
  primaryButtonTextColor: LIGHT_BACKGROUND_COLOR_1,
  secondaryButton: LIGHT_BACKGROUND_COLOR_1,
  secondaryButtonTextColor: LIGHT_FONT_COLOR,
  buttonFontColor: LIGHT_BUTTON_FONT_COLOR,
  textInputBorderFull: `solid 2px ${LIGHT_BACKGROUND_COLOR_0}`,
  textInputBorderFocussed: `solid 2px ${LIGHT_BACKGROUND_COLOR_0}`,
  textInputBorderHovered: `solid 2px ${LIGHT_BACKGROUND_COLOR_0}`,
  border: LIGHT_BACKGROUND_COLOR_1,
  border1: LIGHT_BORDER_COLOR_1,
  borderColor: LIGHT_BORDER_COLOR_1,
  borderFull: `solid 2px ${LIGHT_BORDER_COLOR_1}`,
  borderButton: `solid 2px ${LIGHT_BORDER_COLOR_1}`,
  borderRedLight: LIGHT_RED_BORDER_LIGHT,
  borderRedMed: LIGHT_RED_BORDER_MED,
  copyTooltipColor: LIGHT_BRAND_COLOR,
  copyTooltipTextColor: LIGHT_BACKGROUND_COLOR_1,
  tableBorder: LIGHT_BORDER_COLOR,
  balanceSkeleton: "rgba(0,0,0,0.15)",
  balanceChangeNegative: "rgb(233, 80, 80, .1)",
  balanceChangePositive: "rgb(53, 166, 58, .1)",
  balanceChangeNeutral: "rgb(78, 87, 104, .1)",
  textBackground: LIGHT_BACKGROUND_COLOR_1,
  textBorder: LIGHT_BORDER_COLOR,
  textPlaceholder: "#4E5768",
  textFieldTextColor: LIGHT_FONT_COLOR_2,
  swapTokensButton: "#FFFFFF",
  icon: "#8F929E",
  approveTransactionTableBackground: LIGHT_BACKGROUND_COLOR_1,
  approveTransactionCloseBackground: "#C2C4CC",
  hoverIconBackground: "#DFE0E5",
  avatarIconBackground: "#DFE0E5",
  text: LIGHT_TEXT_COLOR,
  dangerButton: DANGER_COLOR,
  alpha: "#8F929E",
  scrollbarTrack: LIGHT_BACKGROUND_COLOR_0,
  scrollbarThumb: LIGHT_SCROLLBAR_THUMB_COLOR,
  positive: LIGHT_POSITIVE_COLOR,
  negative: LIGHT_NEGATIVE_COLOR,
  negativeBackground: NEGATIVE_LIGHT,
  neutral: "rgb(78, 87, 104)",
  negativeButtonTextColor: "#fff",
  drawerGradient: `linear-gradient(180deg, ${LIGHT_BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
  boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
  tabBarBoxShadow: "0px -4px 4px rgba(3, 10, 25, 0.02)",
  coralGradient:
    "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
  miniDrawerBackdrop: "#18181b",
  unreadBackground: DARK_UNREAD_BACKGROUND,
  invertedPrimary: "#212121",
  invertedSecondary: "rgba(255, 255, 255, 0.1)",
  invertedTertiary: LIGHT_FONT_COLOR,
  avatarPopoverMenuBackground: LIGHT_BACKGROUND_COLOR_1,
  listItemHover: "#F8F8F9",
  walletCopyButtonHover: "#d6d6d6",
  verified: "#212938",
  chatFadeGradientStart: "rgba(248,248,248,255)",
  chatFadeGradient:
    "linear-gradient(360deg, rgb(255, 255, 255) 20%, rgba(240, 240, 242, 0.5) 100%), #FFFFFF",
  linkColor: "#0057EB",
};

export const darkTheme: Partial<Theme> & {
  custom: { colors: CustomColors; colorsInverted: CustomColors };
} = {
  ...baseTheme,
  components: darkComponentOverrides,
  custom: {
    colors: DARK_COLORS,
    colorsInverted: LIGHT_COLORS,
  },
};

const lightComponentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        "&:hover": {
          background: "#F8F8F9 !important",
        },
      },
    },
  },
  MuiButtonBase: {
    styleOverrides: {
      root: {
        "&:hover": {
          background: "#F8F8F9 !important",
        },
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      button: {
        "&:hover": {
          background: "#F8F8F9 !important",
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        "&:hover": {
          "& svg": {
            color: `${LIGHT_ICON_HOVER_COLOR} !important`,
          },
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

export const lightTheme: Partial<Theme> & {
  custom: { colors: CustomColors; colorsInverted: CustomColors };
} = {
  ...baseTheme,
  components: lightComponentOverrides,
  custom: {
    colors: LIGHT_COLORS,
    colorsInverted: DARK_COLORS,
  },
};

export type CustomTheme = typeof lightTheme & typeof darkTheme;
export const styles = _makeStyles<CustomTheme>;
export const useCustomTheme = useTheme<CustomTheme>;
//@ts-ignore -> Weird hack that works to allow us to have "custom" field in Theme. We should use palettes.
export const styled: CreateMUIStyled<CustomTheme> = muiStyled;
