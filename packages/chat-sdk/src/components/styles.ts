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
    paddingTop: 12,
    paddingBottom: 12,
    background: (props: any) =>
      props.type === "danger"
        ? theme.custom.colors.negativeBackground
        : theme.custom.colors.background,
  },
  strongText: {
    color: theme.custom.colors.fontColor2,
    fontWeight: 600,
    fontSize: 14,
  },
}));
