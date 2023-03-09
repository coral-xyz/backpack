// import { useDarkMode } from "@coral-xyz/recoil";
import { useColorScheme } from "react-native";

export function useTheme() {
  // const isDarkMode = useDarkMode();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return {
    custom: theme.custom,
    colorScheme: colorScheme === "dark" ? "dark" : "light",
  };
}

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
// const BORDER_COLOR_1 = "#52525B";
const POSITIVE_COLOR = "#35A63A";
const NEGATIVE_COLOR = "#E95050";
const SCROLLBAR_THUMB_COLOR = "rgb(153 164 180)";

const LIGHT_BACKGROUND_BACKDROP_COLOR = "#f8f8f9";
// const LIGHT_BACKGROUND_BACKDROP_COLOR =
//   "linear-gradient(180deg, #F8F8F9 0%, #F0F0F2 100%), #FFFFFF";
const LIGHT_BACKGROUND_COLOR_0 = "#F0F0F2";
const LIGHT_BACKGROUND_COLOR_1 = "#ffffff";
const LIGHT_BACKGROUND_COLOR_2 = LIGHT_BACKGROUND_COLOR_0;
const LIGHT_FONT_COLOR = "#030A19";
const LIGHT_FONT_COLOR_1 = "#4E5768";
const LIGHT_FONT_COLOR_2 = LIGHT_FONT_COLOR;
const LIGHT_FONT_COLOR_3 = LIGHT_FONT_COLOR_1;
const LIGHT_BRAND_COLOR = LIGHT_FONT_COLOR;
const LIGHT_BUTTON_FONT_COLOR = FONT_COLOR;
const LIGHT_BORDER_COLOR = "#DFE0E6";
const LIGHT_BORDER_COLOR_1 = "#F0F0F2";
const LIGHT_POSITIVE_COLOR = POSITIVE_COLOR;
const LIGHT_NEGATIVE_COLOR = NEGATIVE_COLOR;
const LIGHT_SCROLLBAR_THUMB_COLOR = SCROLLBAR_THUMB_COLOR;
const LIGHT_ICON_HOVER_COLOR = "#787C89";

const DANGER_COLOR = "#DC2626";

export const darkTheme: any = {
  custom: {
    borderRadius: {
      large: 12,
      medium: 8,
    },
    colors: {
      brandColor: BRAND_COLOR,
      background: BACKGROUND_COLOR_0,
      backgroundBackdrop: BACKGROUND_BACKDROP_COLOR,
      bg2: BACKGROUND_COLOR_2,
      bg3: BACKGROUND_COLOR_0,
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
      textInputBorderFull: `rgba(255, 255, 255, 0.1)`,
      textInputBorderFocussed: `rgba(255, 255, 255, 0.1)`,
      textInputBorderHovered: `rgba(255, 255, 255, 0.2)`,
      borderFull: BACKGROUND_COLOR_1,
      borderButton: undefined,
      textFieldTextColor: FONT_COLOR_2,
      copyTooltipColor: BRAND_COLOR,
      copyTooltipTextColor: BACKGROUND_COLOR_1,
      tableBorder: BACKGROUND_COLOR_0,
      balanceSkeleton: BACKGROUND_COLOR_1,
      balanceChangeNegative: "rgba(233, 80, 80, 0.1)",
      balanceChangePositive: "rgba(53, 166, 58, 0.1)",
      balanceChangeNeutral: "rgba(78, 87, 104, 0.1)",
      textBackground: BACKGROUND_COLOR_1,
      textPlaceholder: FONT_COLOR_1,
      textBorder: BACKGROUND_COLOR_1,
      swapTokensButton: BACKGROUND_COLOR_0,
      icon: "#787C89",
      approveTransactionTableBackground: BACKGROUND_COLOR_2,
      approveTransactionCloseBackground: BACKGROUND_COLOR_0,
      hoverIconBackground: `rgba(39, 39, 42, ${HOVER_OPACITY})`,
      avatarIconBackground: "#DFE0E5",

      dangerButton: DANGER_COLOR,
      alpha: "#8F929E",
      scrollbarTrack: BACKGROUND_COLOR_0,
      scrollbarThumb: SCROLLBAR_THUMB_COLOR,
      positive: POSITIVE_COLOR,
      negative: NEGATIVE_COLOR,
      neutral: "rgb(78, 87, 104)",
      negativeButtonTextColor: "#fff",
      drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
      tabBarBoxShadow: "0px -4px 4px rgba(3, 10, 25, 0.02)",
      coralGradient:
        "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
    },
  },
};

export const lightTheme: any = {
  // ...baseTheme,
  custom: {
    borderRadius: {
      large: 12,
      medium: 8,
    },
    colors: {
      brandColor: LIGHT_BRAND_COLOR,
      backgroundBackdrop: LIGHT_BACKGROUND_BACKDROP_COLOR,
      background: LIGHT_BACKGROUND_COLOR_0,
      nav: LIGHT_BACKGROUND_COLOR_1,
      bg2: LIGHT_BACKGROUND_COLOR_2,
      bg3: LIGHT_BACKGROUND_COLOR_1,
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
      textInputBorderFull: LIGHT_BACKGROUND_COLOR_0,
      textInputBorderFocussed: LIGHT_BACKGROUND_COLOR_0,
      textInputBorderHovered: LIGHT_BORDER_COLOR,
      border: LIGHT_BACKGROUND_COLOR_1,
      border1: LIGHT_BORDER_COLOR_1,
      borderColor: LIGHT_BORDER_COLOR_1,
      borderFull: LIGHT_BORDER_COLOR_1,
      borderButton: `solid 2px ${LIGHT_BORDER_COLOR_1}`,
      copyTooltipColor: LIGHT_BRAND_COLOR,
      copyTooltipTextColor: LIGHT_BACKGROUND_COLOR_1,
      tableBorder: LIGHT_BORDER_COLOR,
      balanceSkeleton: "rgba(0,0,0,0.15)",
      balanceChangeNegative: "rgba(233, 80, 80, 0.1)",
      balanceChangePositive: "rgba(53, 166, 58, 0.1)",
      balanceChangeNeutral: "rgba(78, 87, 104, 0.1)",
      textBackground: LIGHT_BACKGROUND_COLOR_1,
      textBorder: LIGHT_BORDER_COLOR,
      textPlaceholder: "#4E5768",
      swapTokensButton: "#FFFFFF",
      icon: "#8F929E",
      approveTransactionTableBackground: LIGHT_BACKGROUND_COLOR_1,
      approveTransactionCloseBackground: "#C2C4CC",
      hoverIconBackground: LIGHT_ICON_HOVER_COLOR,
      avatarIconBackground: "#DFE0E5",

      dangerButton: DANGER_COLOR,
      alpha: "#8F929E",
      scrollbarTrack: LIGHT_BACKGROUND_COLOR_0,
      scrollbarThumb: LIGHT_SCROLLBAR_THUMB_COLOR,
      positive: LIGHT_POSITIVE_COLOR,
      negative: LIGHT_NEGATIVE_COLOR,
      neutral: "rgb(78, 87, 104)",
      negativeButtonTextColor: "#fff",
      drawerGradient: `linear-gradient(180deg, ${LIGHT_BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
      boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
      tabBarBoxShadow: "0px -4px 4px rgba(3, 10, 25, 0.02)",
      coralGradient:
        "linear-gradient(113.94deg, #3EECB8 15.93%, #A372FE 58.23%, #FE7D4A 98.98%)",
    },
  },
};

export type CustomTheme = typeof lightTheme & typeof darkTheme;
