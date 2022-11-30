import { IconButton } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import TextsmsIcon from "@mui/icons-material/Textsms";

const useStyles = styles((theme) => ({
  horizontalCenter: {
    display: "flex",
    justifyContent: "center",
  },
  smallTitle: {
    color: theme.custom.colors.smallTextColor,
    fontWeight: 600,
  },
  contactIconOuter: {
    background: theme.custom.colors.textBorder,
  },
}));
export const EmptyChat = () => {
  const classes = useStyles();
  const theme = useCustomTheme();

  return (
    <div>
      <br />
      <br />
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <IconButton className={classes.contactIconOuter} size={"large"}>
          <TextsmsIcon style={{ color: theme.custom.colors.fontColor }} />
        </IconButton>
      </div>
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <div className={classes.smallTitle}>
          This chat is empty at the moment.
        </div>
      </div>
    </div>
  );
};
