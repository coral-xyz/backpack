import { styles } from "@coral-xyz/themes";

export const useStyles = styles((theme) => ({
  horizontalCenter: {
    display: "flex",
    justifyContent: "center",
  },
  smallTitle: {
    color: theme.custom.colors.smallTextColor,
    fontWeight: 600,
  },
  text: {
    color: theme.custom.colors.fontColor2,
  },
  contactIconOuter: {
    background: theme.custom.colors.textBorder,
  },
  noContactBanner: {
    marginTop: 1,
    background: theme.custom.colors.backgroundBackdrop,
    height: 36,
  },
}));
