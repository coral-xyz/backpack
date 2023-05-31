import color from "color";
// Opacities without color values ///////////////////////////////////////////////
// Disabled elements should be 0.5 opacity
// Hover can be 0.8 opacity if complex component

// Brand Colors
export const baseWhite = "#ffffff";
export const brandBackpackLogoRed = "#e33e3f";
export const brandPixelBlurple = "#6360ff";
export const brandPixelLavender = "#c061f7";
export const brandPixelOcean = "#28dbd1";
export const brandPixelCoral = "#fe6f5c";
export const brandPixelLemon = "#feed5c";

// Accent Colors
export const lightAccentBlue = "#0057eb";
export const lightAccentPurple = "#9b34ef";
export const darkAccentBlue = "#4c94ff";
export const darkAccentPurple = "#e17aff";

// Neutral Colors
export const base50 = "rgba(244, 244, 246, 1)"; // formerly #f8f8f9
export const base100 = "rgba(238, 239, 241, 1)"; // formerly #f0f0f2
export const base200 = "rgba(227, 228, 232, 1)"; // formerly #dfe0e5
export const base300 = "rgba(200, 201, 208, 1)"; // formerly #c2c4cc
export const base400 = "rgba(142, 145, 159, 1)"; // formerly #8f929e
export const base500 = "rgba(117, 121, 138, 1)"; // formerly #787c89
export const base600 = "rgba(93, 96, 111, 1)"; // formerly #555c6b
export const base700 = "rgba(70, 72, 83, 1)"; // formerly #4e5768
export const base800 = "rgba(32, 33, 39, 1)"; // formerly #212938
export const base900 = "rgba(20, 21, 27, 1)"; // formerly #030a19

// Success Colors
export const green100 = "rgba(224, 248, 239, 1)"; // formerly #f1ffef
export const green500 = "rgba(0, 194, 120, 1)"; //formerly #42c337
export const green600 = "rgba(0, 158, 99, 1)"; // formerly #11a800
export const green700 = "rgba(0, 121, 75, 1)"; // formerly #138600

// Warning Colors
export const yellow100 = "rgba(255, 249, 223, 1)"; // formerly #fff9df
export const yellow500 = "rgba(239, 164, 17, 1)"; // formerly #efa411
export const yellow600 = "rgba(206, 121, 7, 1)"; // formerly #ce7907
export const yellow700 = "rgba(177, 87, 0, 1)"; // formerly #b15700

// Error Colors
export const red100 = "rgba(255, 237, 235, 1)"; // previously #ffedeb
export const red500 = "rgba(23, 80, 80, 1)"; // previously #FF6269
export const red600 = "rgba(234, 56, 59, 1)"; // previously #f13236
export const red700 = "rgba(210, 0, 36, 1)"; // previously #d20024

// Light Mode /////////////////////////////////////////////////////

// export const lightNeutralBackgroundAppBackground = "linear-gradient(to bottom, #f8f8f9 0%,#f0f0f2 100%)";

// Light Mode Backgrounds
export const lightBaseBackgroundL0 = base50; // card background
export const lightBaseBackgroundL1 = base100; // light mode border

// Light Mode Text
export const lightBaseTextHighEmphasis = base900;
export const lightBaseTextMedEmphasis = base600;

// Light Mode Icons
export const lightBaseIcon = base400; // this meets 3:1 color contrast on white for WCAG AA
export const lightBaseIconHover = base500; // increase contrast on hover
export const lightBaseIconPress = base400; // decrease contrast on press

// Light Mode Borders
export const lightBaseBorderLight = base100; // default border color
// export const lightBaseBorderMed = base200; // idk if we need this

// Light Mode Buttons
export const lightButtonPrimaryBackground = base900;
export const lightButtonPrimaryText = base50;
export const lightButtonSecondaryBackground = baseWhite;
export const lightButtonSecondaryText = base900;

// Light Mode Success
export const lightGreenText = green700;
export const lightGreenIcon = green600;
export const lightGreenBorder = color(green600).alpha(0.4).string();
export const lightGreenBackgroundSolid = green100;
export const lightGreenBackgroundTransparent = color(green500)
  .alpha(0.12)
  .string();

// Light Mode Warning
export const lightYellowText = yellow700;
export const lightYellowIcon = yellow600;
export const lightYellowBorder = color(yellow700).alpha(0.5).string();
export const lightYellowBackgroundSolid = yellow100;
export const lightYellowBackgroundTransparent = color(yellow500)
  .alpha(12)
  .string();

// Light Mode Error
export const lightRedText = red700;
export const lightRedIcon = red600;
export const lightRedBorder = color(red700).alpha(0.5).string();
export const lightRedBackgroundSolid = red100;
export const lightRedBackgroundTransparent = color(red500).alpha(0.12).string();

// Dark Mode //////////////////////////////////////////////////////

// Dark Mode Backgrounds
export const darkBaseBackgroundL0 = base900; // dark container background
export const darkBaseBackgroundL1 = base800; // dark content background

// Dark Mode Text
export const darkBaseTextHighEmphasis = base50;
export const darkBaseTextMedEmphasis = base400;

// Dark Mode Icons
export const darkBaseIcon = base500; // meets 3:1 color contrast on base800 for WCAG AA
export const darkBaseIconHover = base400; // increase contrast on hover
export const darkBaseIconPress = base500; // decrease contrast on press
export const darkBaseIconHighContrast = base400; // icon hover if not using opacity

// Dark Mode Borders
export const darkBaseBorderLight = color(baseWhite).alpha(0.1).string();
// export const darkBaseBorderMed = color(baseWhite).alpha(0.25); idk if we need this

// Dark Mode Buttons
export const darkButtonPrimaryBackground = baseWhite;
export const darkButtonPrimaryText = base900;
export const darkButtonSecondaryBackground = base800;
export const darkButtonSecondaryText = base50;

// Dark Mode Success
export const darkGreenText = green500;
export const darkGreenIcon = green600;
export const darkGreenBorder = color(green500).alpha(0.4).string(); // green500 at 40%
export const darkGreenBackgroundTransparent = color(green500)
  .alpha(0.08)
  .string(); // green500 at 8%
export const darkGreenBackgroundSolid = "rgba(18, 35, 34, 1)"; // derived from putting green500 at 8% opacity on base900

// Dark Mode Warning
export const darkYellowText = yellow500;
export const darkYellowIcon = yellow600;
export const darkYellowBorder = color(yellow500).alpha(0.5).string();
export const darkYellowBackgroundTransparent = color(yellow500)
  .alpha(0.08)
  .string();
export const darkYellowBackgroundSolid = "rgba(38, 32, 26, 1)"; // derived from putting yellow500 at 8% opacity on base900

// Dark Mode Error
export const darkRedText = red500;
export const darkRedIcon = red600;
export const darkRedBorder = color(red600).alpha(0.5).string();
export const darkRedBackgroundTransparent = color(red600).alpha(0.12).string();
export const darkRedBackgroundSolid = "rgba(53, 26, 31, 1)"; // derived from putting red600 at 12% opacity on base900

// Misc Color Definitions ////////////////////////////////////////
export const overlayBackground = color(base900).alpha(0.4).string(); // overlay background is base900 at 40% opacity

const lightUsernameColors = {
  lightUser01: "#E02929",
  lightUser02: "#CC2578",
  lightUser03: "#9930B8",
  lightUser04: "#5E35B1",
  lightUser05: "#3949AB",
  lightUser06: "#0072DB",
  lightUser07: "#0C5ADF",
  lightUser08: "#008577",
  lightUser09: "#1A841F",
  lightUser10: "#6C7D26",
  lightUser11: "#BD5B00",
  lightUser12: "#CC4218",
  lightUser13: "#6D4C41",
  lightUser14: "#2D4363",
};

const darkUsernameColors = {
  darkUser01: "#F88484",
  darkUser02: "#E57AB0",
  darkUser03: "#DA8BE7",
  darkUser04: "#C2A6F4",
  darkUser05: "#97A4F4",
  darkUser06: "#57AEFF",
  darkUser07: "#5596F6",
  darkUser08: "#7ACCC7",
  darkUser09: "#75DD7A",
  darkUser10: "#BEE05A",
  darkUser11: "#FFD080",
  darkUser12: "#FA9476",
  darkUser13: "#BCAAA4",
  darkUser14: "#A3B5CF",
};

export const lightColors = {
  baseWhite,
  ...lightUsernameColors,
  lightAccentBlue,
  lightAccentPurple,
  lightBaseBackgroundL0,
  lightBaseBackgroundL1,
  lightBaseBorderLight,
  lightBaseIcon,
  lightBaseIconHover,
  lightBaseIconPress,
  lightBaseTextHighEmphasis,
  lightBaseTextMedEmphasis,
  lightButtonPrimaryBackground,
  lightButtonPrimaryText,
  lightButtonSecondaryBackground,
  lightButtonSecondaryText,
  lightGreenBackgroundSolid,
  lightGreenBackgroundTransparent,
  lightGreenBorder,
  lightGreenIcon,
  lightGreenText,
  lightRedBackgroundSolid,
  lightRedBackgroundTransparent,
  lightRedBorder,
  lightRedIcon,
  lightRedText,
  lightYellowBackgroundSolid,
  lightYellowBackgroundTransparent,
  lightYellowBorder,
  lightYellowIcon,
  lightYellowText,
};

export const darkColors = {
  baseWhite,
  ...darkUsernameColors,
  darkAccentBlue,
  darkAccentPurple,
  darkBaseBackgroundL0,
  darkBaseBackgroundL1,
  darkBaseBorderLight,
  darkBaseIcon,
  darkBaseIconHighContrast,
  darkBaseIconHover,
  darkBaseIconPress,
  darkBaseTextHighEmphasis,
  darkBaseTextMedEmphasis,
  darkButtonPrimaryBackground,
  darkButtonPrimaryText,
  darkButtonSecondaryBackground,
  darkButtonSecondaryText,
  darkGreenBackgroundTransparent,
  darkGreenBackgroundSolid,
  darkGreenBorder,
  darkGreenIcon,
  darkGreenText,
  darkRedBackgroundSolid,
  darkRedBackgroundTransparent,
  darkRedBorder,
  darkRedIcon,
  darkRedText,
  darkYellowBackgroundSolid,
  darkYellowBackgroundTransparent,
  darkYellowBorder,
  darkYellowIcon,
  darkYellowText,
};
