/* eslint-disable mui-custom/unused-styles */
import { temporarilyMakeStylesForBrowserExtension } from "@coral-xyz/tamagui";

export const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  searchField: {
    marginTop: 0,
    marginBottom: 0,
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      border: "none !important",
      background: "transparent",
      "& input": {
        paddingTop: 4,
        paddingBottom: 4,
      },
      "& fieldset": {
        border: "none !important",
      },
    },
  },
  icon: {
    background: theme.custom.colors.textBackground,
  },
  iconInner: {
    background: theme.custom.colors.fontColor,
  },
  topImage: {
    maxWidth: "25vw",
  },
  horizontalCenter: {
    display: "flex",
    justifyContent: "center",
  },
  container: {
    marginLeft: "16px",
    marginRight: "16px",
  },
  roundBtn: {
    marginLeft: 8,
    borderRadius: 20,
    width: 20,
    height: 20,
    cursor: "pointer",
    background: "#FFFFFF",
    border: "2px solid #F0F0F2",
    fontSize: 10,
  },
  add: {
    width: 17,
    paddingBottom: 6,
    paddingRight: 1,
  },
  iconCircular: {
    width: "32px",
    height: "32px",
    borderRadius: "16px",
    marginRight: "8px",
    color: theme.custom.colors.positive,
  },
  iconCircularBig: {
    width: "40px",
    height: "40px",
    borderRadius: "16px",
    marginRight: "8px",
    color: theme.custom.colors.positive,
  },
  hoverParent: {
    "&:hover $hoverChild, & .Mui-focused $hoverChild": {
      visibility: "visible",
    },
  },
  hoverChild: {
    visibility: "hidden",
  },
  text: {
    color: theme.custom.colors.fontColor2,
  },
  smallText: {
    fontSize: 12,
    color: theme.custom.colors.fontColor2,
  },
  userText: {
    fontSize: 16,
    marginTop: 4,
    color: theme.custom.colors.fontColor2,
  },
  userTextSmall: {
    fontSize: 14,
    color: theme.custom.colors.fontColor2,
  },
  timestamp: {
    fontSize: 14,
    minWidth: 60,
    color: theme.custom.colors.fontColor2,
  },
  smallTitle: {
    color: theme.custom.colors.smallTextColor,
    fontWeight: 600,
  },
  smallSubTitle: {
    color: theme.custom.colors.smallTextColor,
    fontWeight: 500,
  },
  contactIconOuter: {
    background: theme.custom.colors.textBorder,
  },
  menuItem: {
    fontWeight: 400,
    fontSize: 14,
    color: theme.custom.colors.fontColor,
    padding: "12px 16px",
  },
  menu: {
    "& .MuiList-root": {
      padding: 0,
    },
    paddingTop: 0,
    paddingBottom: 0,
    minWidth: 184,
    color: theme.custom.colors.fontColor,
  },
}));
