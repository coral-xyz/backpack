import { BACKEND_API_URL } from "@coral-xyz/common";
import { useStyles } from "./styles";
import { useState } from "react";
import { useChatContext } from "./ChatContext";
import { useCustomTheme } from "@coral-xyz/themes";
import InfoIcon from "@mui/icons-material/Info";

export const Banner = () => {
  const {
    areFriends,
    requested,
    remoteUserId,
    spam,
    blocked,
    setRequested,
    setSpam,
  } = useChatContext();
  const classes = useStyles();

  if (spam) {
    return <TextBanner title={"You marked this account as spam"} />;
  }

  if (blocked) {
    return <TextBanner title={"You have blocked this account"} />;
  }

  return (
    <div>
      {!areFriends && (
        <div
          style={{ justifyContent: "center", display: "flex", marginBottom: 5 }}
        >
          {!requested && (
            <div
              className={classes.text}
              style={{ cursor: "pointer", marginRight: 15 }}
              onClick={async () => {
                await fetch(`${BACKEND_API_URL}/friends/request`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ to: remoteUserId, sendRequest: true }),
                });
                setRequested(true);
              }}
            >
              Send Friend Request
            </div>
          )}
          <div
            className={classes.text}
            style={{ cursor: "pointer" }}
            onClick={async () => {
              await fetch(`${BACKEND_API_URL}/friends/spam`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ to: remoteUserId, spam: true }),
              });
              setSpam(true);
            }}
          >
            Mark as spam
          </div>
          <br />
        </div>
      )}
    </div>
  );
};

function TextBanner({ title }: { title: String }) {
  const theme = useCustomTheme();
  const classes = useStyles();
  return (
    <div>
      <div
        className={`${classes.noContactBanner} ${classes.horizontalCenter} ${classes.text}`}
      >
        {" "}
        <InfoIcon
          style={{ color: theme.custom.colors.fontColor, marginRight: 5 }}
        />{" "}
        {title}
      </div>
      <br />
    </div>
  );
}
