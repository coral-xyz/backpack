import React from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import Close from "@mui/icons-material/Close";
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
      color: theme.custom.colors.icon,
      width: "0.8em",
    },
  })
);

export const ReplyContainer = ({
  parent_username,
  text,
  showCloseBtn,
  marginBottom,
  padding,
  align = "left",
}) => {
  const { setActiveReply } = useChatContext();

  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div
      style={{
        padding: padding,
        marginBottom: marginBottom || 6,
        background: theme.custom.colors.bg3,
        transform: showCloseBtn && "translateY(10px)",
        paddingBottom: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: align === "left" ? "row" : "row-reverse",
          backgroundColor: showCloseBtn && theme.custom.colors.bg4,
          paddingBottom: showCloseBtn && 6,
          borderTopLeftRadius: showCloseBtn && 8,
          borderTopRightRadius: showCloseBtn && 8,
          padding: showCloseBtn && 6,
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
            onClick={() =>
              setActiveReply({ parent_client_generated_uuid: null })
            }
          >
            <Close className={classes.icon} />
          </div>
        )}
      </div>
    </div>
  );
};
