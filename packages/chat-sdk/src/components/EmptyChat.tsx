import { IconButton } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import TextsmsIcon from "@mui/icons-material/Textsms";
import { useStyles } from "./styles";
import { useChatContext } from "./ChatContext";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useState } from "react";

export const EmptyChat = () => {
  const classes = useStyles();
  const theme = useCustomTheme();

  return (
    <div>
      <div
        className={classes.horizontalCenter}
        style={{ marginBottom: 16, marginTop: 10 }}
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
