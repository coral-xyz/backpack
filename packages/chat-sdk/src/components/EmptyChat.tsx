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
        <TextsmsIcon style={{ color: theme.custom.colors.icon }} />
      </div>
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <div className={classes.smallTitle}>
          This is the beginning of your chat history.
        </div>
      </div>
    </div>
  );
};
