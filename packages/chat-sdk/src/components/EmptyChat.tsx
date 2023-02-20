import { styles, useCustomTheme } from "@coral-xyz/themes";
import TextsmsIcon from "@mui/icons-material/Textsms";
import { IconButton } from "@mui/material";

import { useStyles } from "./styles";

export const EmptyChat = () => {
  const classes = useStyles();
  const theme = useCustomTheme();

  return (
    <div>
      <div
        className={classes.horizontalCenter}
        style={{ marginBottom: 16, marginTop: 20 }}
      >
        <IconButton className={classes.contactIconOuter} size={"large"}>
          <TextsmsIcon style={{ color: theme.custom.colors.fontColor }} />
        </IconButton>
      </div>
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <div className={classes.smallTitle}>
          This is the beginning of your chat history.
        </div>
      </div>
    </div>
  );
};
