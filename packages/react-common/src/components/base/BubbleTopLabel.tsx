import { styles } from "@coral-xyz/themes";

const useStyles = styles((theme) => ({
  topLabel: {
    fontSize: 14,
    color: theme.custom.colors.smallTextColor,
    marginLeft: 4,
    marginBottom: 4,
  },
}));

export const BubbleTopLabel = ({ text }: { text: string }) => {
  const classes = useStyles();
  return <div className={classes.topLabel}>{text}</div>;
};
