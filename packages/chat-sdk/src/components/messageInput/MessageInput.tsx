import { useContext, useEffect, useMemo } from "react";
import { RichMentionsContext, RichMentionsInput } from "react-rich-mentions";
import { BACKPACK_TEAM } from "@coral-xyz/common";
import { BackpackStaffIcon } from "@coral-xyz/react-common";
import { useUsersMetadata } from "@coral-xyz/chat-xplat";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CircularProgress } from "@mui/material";

import { useChatContext } from "../ChatContext";

const useStyles = styles(() => ({
  input: {
    "&:hover": {
      cursor: "text",
    },
  },
}));

export const chatMessageInputId = "backpack-message-input";

export function MessageInput({
  setPluginMenuOpen,
  autoFocus = true,
  onMediaSelect
}: {
  setPluginMenuOpen: any;
  autoFocus?: boolean;
  onMediaSelect: any;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { type, remoteUsername, activeReply } = useChatContext();
  const { activeSearch } = useContext(RichMentionsContext);

  const uploadFromClipboard = (e:React.ClipboardEvent<HTMLDivElement>):void => {
    if(e.clipboardData.files.length > 0) {
      let file = e.clipboardData.files[0];
      onMediaSelect(file)
    }
  }

  useEffect(() => {
    if (autoFocus) {
      const messageElement = document.getElementById(chatMessageInputId);

      if (messageElement) {
        messageElement.focus();
      }
    }
  }, [autoFocus]);

  return (
    <div style={{ width: "100%", padding: 10 }}>
      <RichMentionsInput
        id={chatMessageInputId}
        onKeyDown={(event) => {
          if (event.key === "Enter" && activeSearch) {
            event.stopPropagation();
          }
        }}
        className={classes.input}
        onClick={() => setPluginMenuOpen(false)}
        onPaste={(e) => uploadFromClipboard(e)}
        placeholder={
          type === "individual"
            ? `Message @${remoteUsername}`
            : activeReply?.parent_username
            ? "Reply"
            : "Write a message..."
        }
        style={{
          outline: "0px solid transparent",
          color: theme.custom.colors.fontColor,
          fontSize: "14px",
          wordBreak: "break-word",
        }}
        defaultValue=""
      />
    </div>
  );
}

export const CustomAutoComplete = () => {
  const theme = useCustomTheme();
  const { loading, results, activeSearch, selectItem, index } =
    useContext(RichMentionsContext);
  const cursor = index;

  const shownResults = useMemo(() => results, [results]);

  const users = useUsersMetadata({ remoteUserIds: results.map((r) => r.id) });

  // if there are no users to show in mentions
  if (activeSearch && !loading && shownResults?.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        width: 180,
        position: "absolute",
        bottom: 44,
        boxShadow: theme.custom.colors.boxShadow,
        background: theme.custom.colors.bg3,
        paddingTop: activeSearch && 8,
        paddingBottom: activeSearch && 8,
        borderRadius: 8,
        backdropFilter: "blur(20px)",
        overflow: "hidden",
      }}
    >
      {shownResults.map((item, index) => (
        <button
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 8,
            paddingBottom: 8,
            display: "flex",
            cursor: "pointer",
            width: "100%",
            background:
              index === cursor
                ? theme.custom.colors.listItemHover
                : "transparent",
            color: theme.custom.colors.fontColor,
            border: "none",
            textAlign: "left",
            alignItems: "center",
          }}
          key={item.ref}
          onClick={() => {
            selectItem(item);
          }}
        >
          <img
            style={{ height: 24, borderRadius: 12, marginRight: 8 }}
            src={users[item.id]?.image}
          />
          <div style={{ fontSize: 14 }}>@{item.name}</div>
          {BACKPACK_TEAM.includes(item.id) ? <BackpackStaffIcon /> : null}
        </button>
      ))}
      {activeSearch !== "" &&
      activeSearch &&
      activeSearch.length !== 0 &&
      loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 3,
            marginTop: 3,
          }}
        >
          {" "}
          <CircularProgress size={20} />{" "}
        </div>
      ) : null}
    </div>
  );
};
