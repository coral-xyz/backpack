import { styles } from "@coral-xyz/themes";

export const useStyles = styles((theme) => ({
  searchField: {
    marginTop: "16px",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      "& input": {
        paddingTop: 0,
        paddingBottom: 0,
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
    marginLeft: "12px",
    marginRight: "12px",
  },
  roundBtn: {
    marginLeft: 8,
    borderRadius: 24,
    width: 24,
    height: 24,
    cursor: "pointer",
    background: "#FFFFFF",
    border: "2px solid #F0F0F2",
    fontSize: 10,
  },
  add: {
    width: 20,
    paddingBottom: 2,
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
}));
