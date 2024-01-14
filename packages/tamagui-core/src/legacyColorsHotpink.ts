export const TEXT_COLOR = "hotpink"; // "#fff";
export const BACKGROUND_COLOR_0 = "hotpink"; // "#18181b";
export const BACKGROUND_BACKDROP_COLOR = BACKGROUND_COLOR_0;
export const BACKGROUND_COLOR_1 = "hotpink"; // "#27272a";
export const BACKGROUND_COLOR_2 = "hotpink"; // "#3F3F46";
export const FONT_COLOR = "hotpink"; // "#FFFFFF";
export const FONT_COLOR_1 = "hotpink"; // "#71717A";
export const FONT_COLOR_2 = "hotpink"; // "#D4D4D8";
export const FONT_COLOR_3 = "hotpink"; // "#A1A1AA";
export const BRAND_COLOR = "hotpink"; // "#FFFFFF";
export const BUTTON_FONT_COLOR = FONT_COLOR;
export const BORDER_COLOR = "hotpink"; // "#393C43";
export const POSITIVE_COLOR = "hotpink"; // "#35A63A";
export const NEGATIVE_COLOR = "hotpink"; // "#E95050";
export const NEGATIVE_COLOR_2 = "hotpink"; // "rgba(210, 0, 36, 1)";
export const SCROLLBAR_THUMB_COLOR = "hotpink"; // "rgb(153 164 180)";
export const LIGHT_TEXT_SMALL_COLOR = "hotpink"; // "#4E5768";
export const DARK_TEXT_SMALL_COLOR = "hotpink"; // "#8F929E";

export const NEGATIVE_LIGHT = "hotpink"; // "#FFF4F3";
export const NEGATIVE_DARK = "hotpink"; // "#FFF4F3";

export const LIGHT_TEXT_COLOR = FONT_COLOR_1;
// export const LIGHT_BACKGROUND_BACKDROP_COLOR =
//   "linear-gradient(180deg, &F8F8F9 0%, &F0F0F2 100%), &FFFFFF";
export const LIGHT_BACKGROUND_BACKDROP_COLOR =
  "linear-gradient(180deg, hotpink 0%, hotpink 100%), hotpink";
export const LIGHT_BACKGROUND_COLOR_0 = "hotpink"; // "#F0F0F2";
export const LIGHT_BACKGROUND_COLOR_1 = "hotpink"; // "#ffffff";
export const LIGHT_BACKGROUND_COLOR_2 = LIGHT_BACKGROUND_COLOR_0;
export const LIGHT_FONT_COLOR = "hotpink"; // "#030A19";
export const LIGHT_FONT_COLOR_1 = "hotpink"; // "#4E5768";
export const LIGHT_FONT_COLOR_2 = LIGHT_FONT_COLOR;
export const LIGHT_FONT_COLOR_3 = LIGHT_FONT_COLOR_1;
export const LIGHT_BRAND_COLOR = LIGHT_FONT_COLOR;
export const LIGHT_BUTTON_FONT_COLOR = FONT_COLOR;
export const LIGHT_BORDER_COLOR = "hotpink"; // "#DFE0E6";
export const LIGHT_BORDER_COLOR_1 = "hotpink"; // "#F0F0F2";
export const LIGHT_POSITIVE_COLOR = POSITIVE_COLOR;
export const LIGHT_POSITIVE_COLOR_2 = "hotpink"; // "rgba(0, 121, 75, 1)";
export const LIGHT_NEGATIVE_COLOR = NEGATIVE_COLOR;
export const LIGHT_SCROLLBAR_THUMB_COLOR = SCROLLBAR_THUMB_COLOR;
export const LIGHT_ICON_HOVER_COLOR = "hotpink"; // "#787C89";
export const LIGHT_UNREAD_BACKGROUND = "hotpink"; // "rgba(99, 96, 255, 0.1)";
export const DARK_UNREAD_BACKGROUND = "hotpink"; // "rgba(99, 96, 255, 0.1)";

export const DANGER_COLOR = "hotpink"; // "#DC2626";
export const DANGER_COLOR2 = "hotpink"; // "rgba(255, 237, 235, 1)";
export const DANGER_DARK_COLOR = "hotpink"; // "#DC2626";

// Migration to colours from Figma design system
export const LIGHT_RED_BORDER_LIGHT = "hotpink"; // "#FFEDEB";
export const LIGHT_RED_BORDER_MED = "hotpink"; // "#FFDCD9";
export const DARK_RED_BORDER_LIGHT = "hotpink"; // "rgba(241,50,54,0.4)";
export const DARK_RED_BORDER_MED = "hotpink"; // "rgba(241,50,54,0.4)";

// NOTE: Do not include anything but colors in here. No box shadows, borders, etc.
export const DARK_COLORS: CustomColors = {
  blue: "hotpink", // "#3498db",
  smallTextColor: DARK_TEXT_SMALL_COLOR,
  brandColor: BRAND_COLOR,
  background: BACKGROUND_COLOR_0,
  backgroundBackdrop: BACKGROUND_BACKDROP_COLOR,
  banner: BACKGROUND_COLOR_1,
  bg2: BACKGROUND_COLOR_2,
  bg3: BACKGROUND_COLOR_0,
  bg4: "hotpink", // "rgba(255, 255, 255, 0.2)",
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
  textFieldTextColor: FONT_COLOR_2,
  copyTooltipColor: BRAND_COLOR,
  copyTooltipTextColor: BACKGROUND_COLOR_1,
  tableBorder: BACKGROUND_COLOR_0,
  tableCellBorder: "1px solid hotpink",
  // tableCellBorder: "1px solid rgba(255, 255, 255, 0.1)",
  balanceSkeleton: "hotpink", // "rgba(39, 39, 42, 0.5)",
  balanceSkeletonForeground: "hotpink", // "rgba(39, 39, 42, 0.2)",
  balanceChangeNegative: "hotpink", // "rgb(233, 80, 80, 0.1)",
  balanceChangePositive: "hotpink", // "rgb(53, 166, 58, 0.1)",
  balanceChangeNeutral: "hotpink", // "rgb(78, 87, 104, 0.1)",
  textBackground: BACKGROUND_COLOR_1,
  textPlaceholder: FONT_COLOR_1,
  textBorder: BACKGROUND_COLOR_1,
  switchTokensButton: BACKGROUND_COLOR_0,
  icon: "hotpink", // "#787C89",
  approveTransactionTableBackground: BACKGROUND_COLOR_2,
  approveTransactionCloseBackground: BACKGROUND_COLOR_0,
  hoverIconBackground: "hotpink", // `rgb(39, 39, 42, ${HOVER_OPACITY})`,
  avatarIconBackground: "hotpink", // "#DFE0E5",
  text: TEXT_COLOR,
  dangerButton: DANGER_DARK_COLOR,
  dangerButton2: DANGER_COLOR2,
  successButton: "hotpink", // "#2ecc71",
  alpha: "hotpink", // "#8F929E",
  scrollbarTrack: BACKGROUND_COLOR_0,
  scrollbarThumb: SCROLLBAR_THUMB_COLOR,
  positive: POSITIVE_COLOR,
  positive2: LIGHT_POSITIVE_COLOR_2,
  negative: NEGATIVE_COLOR,
  negative2: NEGATIVE_COLOR_2,
  negativeBackground: NEGATIVE_DARK,
  neutral: "hotpink", // "rgb(78, 87, 104)",
  negativeButtonTextColor: "hotpink", // "#fff",
  unreadBackground: LIGHT_UNREAD_BACKGROUND,
  invertedPrimary: "hotpink", // "#FFFFFF",
  invertedSecondary: LIGHT_BACKGROUND_COLOR_0,
  invertedTertiary: "white",
  avatarPopoverMenuBackground: BACKGROUND_COLOR_0,
  listItemHover: "hotpink", // `rgba(39, 39, 42, ${HOVER_OPACITY})`,
  miniDrawerBackdrop: "hotpink", // "rgba(0,0,0,0.3)",
  walletCopyButtonHover: "hotpink", // "#18181c",
  verified: "hotpink", // "#DFE0E5",
  linkColor: "hotpink", // "#4C94FF",
  chatFadeGradientStart: "hotpink", // "rgba(255, 255, 255, 0.04)",
  onboardingBackpackLabel: "hotpink", // "#D0D0D1",
} as const;

// NOTE: Do not include anything but colors in here. No box shadows, borders, etc.
export const LIGHT_COLORS: CustomColors = {
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
  invertedBg4: "hotpink", // "rgba(255, 255, 255, 0.2)",
  fontColor: LIGHT_FONT_COLOR,
  successButton: "hotpink", // "#2ecc71",
  fontColor2: LIGHT_FONT_COLOR_2,
  fontColor3: LIGHT_FONT_COLOR_3,
  fontColor4: LIGHT_FONT_COLOR_2,
  subtext: LIGHT_FONT_COLOR_3,
  secondary: LIGHT_FONT_COLOR_1,
  textInputBackground: LIGHT_BACKGROUND_COLOR_1,
  primaryButton: LIGHT_BRAND_COLOR,
  primaryButtonTextColor: LIGHT_BACKGROUND_COLOR_1,
  secondaryButton: LIGHT_BACKGROUND_COLOR_1,
  secondaryButtonTextColor: LIGHT_FONT_COLOR,
  buttonFontColor: LIGHT_BUTTON_FONT_COLOR,
  border: LIGHT_BACKGROUND_COLOR_1,
  border1: LIGHT_BORDER_COLOR_1,
  borderColor: LIGHT_BORDER_COLOR_1,
  borderRedLight: LIGHT_RED_BORDER_LIGHT,
  borderRedMed: LIGHT_RED_BORDER_MED,
  copyTooltipColor: LIGHT_BRAND_COLOR,
  copyTooltipTextColor: LIGHT_BACKGROUND_COLOR_1,
  tableBorder: LIGHT_BORDER_COLOR,
  tableCellBorder: "1px solid hotpink",
  // tableCellBorder: "1px solid &F0F0F2",
  balanceSkeleton: "hotpink", // "rgb(235, 235, 235)",
  balanceSkeletonForeground: "hotpink", // "rgb(225, 225, 225)",
  balanceChangeNegative: "hotpink", // "rgb(233, 80, 80, .1)",
  balanceChangePositive: "hotpink", // "rgb(53, 166, 58, .1)",
  balanceChangeNeutral: "hotpink", // "rgb(78, 87, 104, .1)",
  textBackground: LIGHT_BACKGROUND_COLOR_1,
  textBorder: LIGHT_BORDER_COLOR,
  textPlaceholder: "hotpink", // "#4E5768",
  textFieldTextColor: LIGHT_FONT_COLOR_2,
  switchTokensButton: "hotpink", // "#FFFFFF",
  icon: "hotpink", // "#8F929E",
  approveTransactionTableBackground: LIGHT_BACKGROUND_COLOR_1,
  approveTransactionCloseBackground: "hotpink", // "#C2C4CC",
  hoverIconBackground: "hotpink", // "#DFE0E5",
  avatarIconBackground: "hotpink", // "#DFE0E5",
  text: LIGHT_TEXT_COLOR,
  dangerButton: DANGER_COLOR,
  dangerButton2: DANGER_COLOR2,
  alpha: "hotpink", // "#8F929E",
  scrollbarTrack: LIGHT_BACKGROUND_COLOR_0,
  scrollbarThumb: LIGHT_SCROLLBAR_THUMB_COLOR,
  positive: LIGHT_POSITIVE_COLOR,
  positive2: LIGHT_POSITIVE_COLOR_2,
  negative: LIGHT_NEGATIVE_COLOR,
  negative2: NEGATIVE_COLOR_2,
  negativeBackground: NEGATIVE_LIGHT,
  neutral: "hotpink", // "rgb(78, 87, 104)",
  negativeButtonTextColor: "hotpink", // "#fff",
  miniDrawerBackdrop: "hotpink", // "rgba(0,0,0,0.3)",
  unreadBackground: DARK_UNREAD_BACKGROUND,
  invertedPrimary: "hotpink", // "#212121",
  invertedSecondary: "hotpink", // "rgba(255, 255, 255, 0.1)",
  invertedTertiary: LIGHT_FONT_COLOR,
  avatarPopoverMenuBackground: LIGHT_BACKGROUND_COLOR_1,
  listItemHover: "hotpink", // "#F8F8F9",
  walletCopyButtonHover: "hotpink", // "#d6d6d6",
  verified: "hotpink", // "#212938",
  chatFadeGradientStart: "hotpink", // "rgba(248,248,248,255)",
  linkColor: "hotpink", // "#0057EB",
  onboardingBackpackLabel: "hotpink", // "#D0D0D1",
};

const LIGHT_WEB_ONLY_NON_COLORS: WebOnlyNonColors = {
  // NON-COLORS BREAK NON-WEB ENVIRONMENTS AKA MOBILE
  // TODO { borderColor: "color", borderWidth: 2, borderStyle: "solid"}
  borderFull: `solid 2px ${LIGHT_BORDER_COLOR_1}`,
  borderButton: `solid 2px ${LIGHT_BORDER_COLOR_1}`,
  textInputBorderFull: `solid 2px ${LIGHT_BACKGROUND_COLOR_0}`,
  textInputBorderFocussed: `solid 2px ${LIGHT_BACKGROUND_COLOR_0}`,
  textInputBorderHovered: `solid 2px ${LIGHT_BACKGROUND_COLOR_0}`,

  drawerGradient: `linear-gradient(180deg, ${LIGHT_BACKGROUND_COLOR_1} 0%, hotpink 100%)`,
  // drawerGradient: `linear-gradient(180deg, ${LIGHT_BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
  boxShadow: "0px 0px 4px hotpink",
  // boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
  tabBarBoxShadow: "0px -4px 4px hotpink",
  // tabBarBoxShadow: "0px -4px 4px rgba(3, 10, 25, 0.02)",
  coralGradient:
    "linear-gradient(113.94deg, hotpink 15.93%, hotpink 58.23%, hotpink 98.98%)",
  // coralGradient:
  //   "linear-gradient(113.94deg, &3EECB8 15.93%, &A372FE 58.23%, &FE7D4A 98.98%)",
  chatFadeGradient:
    "linear-gradient(360deg, hotpink 20%, hotpink 100%), hotpink",
  // chatFadeGradient:
  //   "linear-gradient(360deg, rgb(255, 255, 255) 20%, rgba(240, 240, 242, 0.5) 100%), &FFFFFF",
};

const DARK_WEB_ONLY_NON_COLORS: WebOnlyNonColors = {
  // NON-COLORS BREAK NON-WEB ENVIRONMENTS AKA MOBILE
  // TODO { borderColor: "color", borderWidth: 2, borderStyle: "solid"}
  textInputBorderFull: `solid 2pt ${BACKGROUND_COLOR_1}`,
  textInputBorderFocussed: `solid 2pt ${BACKGROUND_COLOR_1}`,
  textInputBorderHovered: `solid 2pt ${BACKGROUND_COLOR_1}`,
  borderFull: `solid 2px ${BACKGROUND_COLOR_1}`,
  borderButton: `solid 2px ${BACKGROUND_COLOR_1}`,

  drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, hotpink 100%)`,
  //drawerGradient: `linear-gradient(180deg, ${BACKGROUND_COLOR_1} 0%, rgba(41, 44, 51, 0) 100%)`,
  boxShadow: "0px 0px 4px hotpink",
  //boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
  tabBarBoxShadow: "0px -4px 4px hotpink",
  // tabBarBoxShadow: "0px -4px 4px rgba(3, 10, 25, 0.02)",
  coralGradient:
    "linear-gradient(113.94deg, hotpink 15.93%, hotpink 58.23%, hotpink 98.98%)",
  // coralGradient: "linear-gradient(113.94deg, &3EECB8 15.93%, &A372FE 58.23%, &FE7D4A 98.98%)",
  chatFadeGradient:
    "linear-gradient(180deg, hotpink 20%, hotpink 100%), hotpink",
  //chatFadeGradient: "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 20%, rgba(0, 0, 0, 0) 100%), &18181B",
} as const;

export const MOBILE_DARK_OVERRIDES: NativeOverrides = {
  borderFull: BACKGROUND_COLOR_1,
  textInputBorderFull: "hotpink", // `rgba(255, 255, 255, 0.1)`,
  textInputBorderFocussed: "hotpink", // `rgba(255, 255, 255, 0.1)`,
  textInputBorderHovered: "hotpink", // `rgba(255, 255, 255, 0.2)`,
};

export const MOBILE_LIGHT_OVERRIDES: NativeOverrides = {
  borderFull: LIGHT_BORDER_COLOR_1,
  textInputBorderFull: LIGHT_BACKGROUND_COLOR_0,
  textInputBorderFocussed: LIGHT_BACKGROUND_COLOR_0,
  textInputBorderHovered: LIGHT_BORDER_COLOR,
};

export const MUI_DARK_THEME: MuiCustomTheme = {
  ...DARK_COLORS,
  ...DARK_WEB_ONLY_NON_COLORS,
} as const;

export const MUI_LIGHT_THEME: MuiCustomTheme = {
  ...LIGHT_COLORS,
  ...LIGHT_WEB_ONLY_NON_COLORS,
};

// Include box shadows, borders, etc in here.
// Eventually "2px solid black" should be split into borderColor, borderStyle, borderWidth
type WebOnlyNonColors = {
  borderButton: string;
  borderFull: string;
  boxShadow: string;
  chatFadeGradient: string;
  coralGradient: string;
  drawerGradient: string;
  tabBarBoxShadow: string;
  textInputBorderFocussed: string;
  textInputBorderFull: string;
  textInputBorderHovered: string;
};

type NativeOverrides = {
  borderFull: string;
  textInputBorderFull: string;
  textInputBorderFocussed: string;
  textInputBorderHovered: string;
};

// NOTE: Do not include anything but colors in here. No box shadows, borders, etc.
export type CustomColors = {
  alpha: string;
  approveTransactionCloseBackground: string;
  approveTransactionTableBackground: string;
  avatarIconBackground: string;
  avatarPopoverMenuBackground: string;
  background: string;
  backgroundBackdrop: string;
  balanceChangeNegative: string;
  balanceChangeNeutral: string;
  balanceChangePositive: string;
  balanceSkeleton: string;
  balanceSkeletonForeground: string;
  banner: string;
  bg2: string;
  bg3: string;
  bg4: string;
  blue: string;
  border1: string;
  border: string;
  borderColor: string;
  borderRedLight: string;
  borderRedMed: string;
  brandColor: string;
  buttonFontColor: string;
  chatFadeGradientStart: string;
  copyTooltipColor: string;
  copyTooltipTextColor: string;
  dangerButton: string;
  dangerButton2: string;
  fontColor2: string;
  fontColor3: string;
  fontColor4: string;
  fontColor: string;
  hoverIconBackground: string;
  icon: string;
  invertedBg4: string;
  invertedPrimary: string;
  invertedSecondary: string;
  invertedTertiary: string;
  linkColor: string;
  listItemHover: string;
  miniDrawerBackdrop: string;
  nav: string;
  negative: string;
  negative2: string;
  negativeBackground: string;
  negativeButtonTextColor: string;
  neutral: string;
  positive: string;
  positive2: string;
  primaryButton: string;
  primaryButtonTextColor: string;
  scrollbarThumb: string;
  scrollbarTrack: string;
  secondary: string;
  secondaryButton: string;
  secondaryButtonTextColor: string;
  smallTextColor: string;
  subtext: string;
  successButton: string;
  switchTokensButton: string;
  tableBorder: string;
  tableCellBorder: string;
  text: string;
  textBackground: string;
  textBorder: string;
  textFieldTextColor: string;
  textInputBackground: string;
  textPlaceholder: string;
  unreadBackground: string;
  verified: string;
  walletCopyButtonHover: string;
  onboardingBackpackLabel: string;
};

export type MuiCustomTheme = CustomColors & WebOnlyNonColors;
export type NativeCustomTheme = CustomColors & NativeOverrides;
