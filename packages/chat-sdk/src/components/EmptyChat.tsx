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
  const [requestSent, setRequestSent] = useState(false);
  const { areFriends, requested, remoteUserId } = useChatContext();

  return (
    <div>
      {areFriends && <br />}
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <IconButton className={classes.contactIconOuter} size={"large"}>
          <TextsmsIcon style={{ color: theme.custom.colors.fontColor }} />
        </IconButton>
      </div>
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <div className={classes.smallTitle}>
          This is the beginning of your chat history.
        </div>
      </div>
      {!areFriends && (
        <div style={{ justifyContent: "center", display: "flex" }}>
          {!requested && !requestSent && (
            <div
              className={classes.text}
              style={{ cursor: "pointer", marginRight: 10 }}
              onClick={async () => {
                await fetch(`${BACKEND_API_URL}/friends/request`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ to: remoteUserId, sendRequest: true }),
                });
                setRequestSent(true);
              }}
            >
              Add to Contacts
            </div>
          )}
          <div className={classes.text} style={{ cursor: "pointer" }}>
            Mark as spam
          </div>
          <br />
        </div>
      )}
    </div>
  );
};
