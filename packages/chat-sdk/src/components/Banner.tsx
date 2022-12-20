import { useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import InfoIcon from "@mui/icons-material/Info";

import { useChatContext } from "./ChatContext";
import { useStyles } from "./styles";

export const Banner = () => {
  const {
    areFriends,
    requested,
    remoteUserId,
    spam,
    blocked,
    setRequested,
    setSpam,
    remoteRequested,
  } = useChatContext();
  const classes = useStyles();

  if (spam) {
    return (
      <TextBanner
        type={"danger"}
        title={"You marked this account as spam"}
        buttonText={"Undo"}
        onClick={async () => {
          await fetch(`${BACKEND_API_URL}/friends/spam`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ to: remoteUserId, spam: false }),
          });
          setSpam(false);
        }}
      />
    );
  }

  if (blocked) {
    return (
      <TextBanner type={"normal"} title={"You have blocked this account"} />
    );
  }

  return (
    <div>
      {!areFriends && (
        <div
          className={`${classes.noContactBanner} ${classes.horizontalCenter} ${classes.text}`}
        >
          {!requested && (
            <div
              className={classes.strongText}
              style={{ cursor: "pointer", marginRight: 25 }}
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
              {remoteRequested
                ? "Accept Contact Request"
                : "Send Contact Request"}
            </div>
          )}
          <div
            className={classes.strongText}
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
            Mark as Spam
          </div>
          <br />
        </div>
      )}
    </div>
  );
};

function TextBanner({
  title,
  buttonText,
  onClick,
  type,
}: {
  title: String;
  buttonText?: string;
  onClick?: () => void;
  type: "danger" | "normal";
}) {
  const theme = useCustomTheme();
  const classes = useStyles({ type });
  return (
    <div>
      <div
        className={`${classes.noContactBanner} ${classes.horizontalCenter} ${classes.text}`}
      >
        {" "}
        <InfoIcon
          style={{
            color:
              type === "danger"
                ? theme.custom.colors.negative
                : theme.custom.colors.fontColor,
            marginRight: 5,
          }}
        />{" "}
        {title}
        {buttonText && (
          <div style={{ marginLeft: 10, cursor: "pointer" }} onClick={onClick}>
            {buttonText}
          </div>
        )}
      </div>
      <br />
    </div>
  );
}
