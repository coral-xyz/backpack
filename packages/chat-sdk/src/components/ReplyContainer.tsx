import React from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { createStyles, makeStyles } from "@mui/styles";

import { useChatContext } from "./ChatContext";
import { ParsedMessage } from "./ParsedMessage";

const useStyles = makeStyles((theme: any) =>
  createStyles({
    outerDiv: {
      padding: 10,
      background: theme.custom.colors.textBackground,
      backdropFilter: "blur(6px)",
    },
    text: {
      color: theme.custom.colors.fontColor2,
    },
    icon: {
      color: theme.custom.colors.fontColor2,
    },
  })
);

export const ReplyContainer = ({
  parent_username,
  text,
  showCloseBtn,
  marginBottom,
  align = "left",
}) => {
  const { setActiveReply } = useChatContext();
  const classes = useStyles();
  return (
    <div
      style={{
        marginBottom: marginBottom || 6,
        display: "flex",
        justifyContent: "space-between",
        flexDirection: align === "left" ? "row" : "row-reverse",
      }}
    >
      <div>
        <div
          className={classes.text}
          style={{ fontWeight: 500, fontSize: 14, marginBottom: 8 }}
        >
          Replying to {parent_username || ""}
        </div>
        <div
          className={classes.text}
          style={{
            borderLeft: "2px solid #DFE0E6",
            fontWeight: 600,
            paddingLeft: 12,
          }}
        >
          <ParsedMessage message={text} />
        </div>
      </div>
      {showCloseBtn && (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setActiveReply({ parent_client_generated_uuid: null })}
        >
          <HighlightOffIcon className={classes.icon} />
        </div>
      )}
    </div>
  );
};
