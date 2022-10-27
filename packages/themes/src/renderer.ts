import {
  BACKGROUND_COLOR_1,
  FONT_COLOR_2,
  LIGHT_BACKGROUND_COLOR_1,
  LIGHT_FONT_COLOR_2,
  LIGHT_TEXT_COLOR,
  TEXT_COLOR,
} from "./index";

export const lightTheme = {
  custom: {
    colors: {
      text: LIGHT_TEXT_COLOR,
      textBackground: LIGHT_BACKGROUND_COLOR_1,
      fontColor2: LIGHT_FONT_COLOR_2,
    },
  },
};

export const darkTheme = {
  custom: {
    colors: {
      text: TEXT_COLOR,
      textBackground: BACKGROUND_COLOR_1,
      fontColor2: FONT_COLOR_2,
    },
  },
};
