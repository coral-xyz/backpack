import { styles } from "@coral-xyz/themes";

export const useStyles = styles((theme) => ({
  searchField: {
    marginTop: "0px",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      "& input": {
        paddingTop: 0,
        paddingBottom: 0,
      },
      "& fieldset": {
        border: `${theme.custom.colors.borderFull} !important`,
      },
    },
  },
  icon: {
    background: theme.custom.colors.textBackground,
  },
  iconInner: {
    background: theme.custom.colors.fontColor,
  },
  topImageOuter: {
    width: 150,
    height: 150,
    border: `solid 3px ${theme.custom.colors.avatarIconBackground}`,
    borderRadius: "50%",
    display: "inline-block",
    overflow: "hidden",
  },
  topImage: {
    width: 150,
  },
  horizontalCenter: {
    display: "flex",
    justifyContent: "center",
  },
  container: {
    marginLeft: "16px",
    marginRight: "16px",
    height: "100%",
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
    borderRadius: "50%",
    marginRight: "8px",
    color: theme.custom.colors.positive,
  },
  iconCircularBig: {
    width: "40px",
    height: "40px",
    borderRadius: "20px",
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
  userRequestText: {
    color: theme.custom.colors.textPlaceholder,
  },
  timestamp: {
    fontSize: 14,
    color: theme.custom.colors.fontColor2,
  },
  smallTitle: {
    color: theme.custom.colors.smallTextColor,
    fontWeight: 600,
  },
  smallTitle2: {
    color: theme.custom.colors.smallTextColor,
    fontWeight: 500,
    fontSize: 16,
  },
  smallSubTitle: {
    color: theme.custom.colors.smallTextColor,
    fontWeight: 500,
  },
  contactIconOuter: {
    "&:disabled": {
      background: theme.custom.colors.textBorder,
    },
  },
}));
