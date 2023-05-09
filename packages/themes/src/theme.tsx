import createStyles from "@mui/styles/createStyles";
import _makeStyles from "@mui/styles/makeStyles";
import useTheme from "@mui/styles/useTheme";
import type { CreateMUIStyled, Theme } from "@mui/system";
import muiStyled from "@mui/system/styled";

import type { MuiCustomTheme } from "./colors";
import {
  FONT_COLOR_1,
  HOVER_OPACITY,
  LIGHT_ICON_HOVER_COLOR,
  MUI_DARK_THEME,
  MUI_LIGHT_THEME,
} from "./colors";

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

export const darkTheme: Partial<Theme> & {
  custom: { colors: MuiCustomTheme; colorsInverted: MuiCustomTheme };
} = {
  ...baseTheme,
  components: darkComponentOverrides,
  custom: {
    colors: MUI_DARK_THEME,
    colorsInverted: MUI_LIGHT_THEME,
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
  custom: { colors: MuiCustomTheme; colorsInverted: MuiCustomTheme };
} = {
  ...baseTheme,
  components: lightComponentOverrides,
  custom: {
    colors: MUI_LIGHT_THEME,
    colorsInverted: MUI_DARK_THEME,
  },
};

export type CustomTheme = typeof lightTheme & typeof darkTheme;
export const styles = _makeStyles<CustomTheme>;
export const useCustomTheme = useTheme<CustomTheme>;
//@ts-ignore -> Weird hack that works to allow us to have "custom" field in Theme. We should use palettes.
export const styled: CreateMUIStyled<CustomTheme> = muiStyled;
