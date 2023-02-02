import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RichMentionsContext, RichMentionsInput } from "react-rich-mentions";
import { useUsersMetadata } from "@coral-xyz/react-common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CircularProgress } from "@mui/material";

import { useChatContext } from "../ChatContext";

const useStyles = styles((themes) => ({
  input: {
    "&:hover": {
      cursor: "text",
    },
  },
}));

export function MessageInput({ setEmojiMenuOpen }: { setEmojiMenuOpen: any }) {
  const defaultValue = "";
  const classes = useStyles();
  const theme = useCustomTheme();
  const { type, remoteUsername } = useChatContext();

  return (
    <div style={{ width: "100%", padding: 10 }}>
      <RichMentionsInput
        className={classes.input}
        onClick={() => setEmojiMenuOpen(false)}
        placeholder={
          type === "individual"
            ? `Message @${remoteUsername}`
            : "Write a message..."
        }
        style={{
          outline: "0px solid transparent",
          color: theme.custom.colors.fontColor,
          fontSize: "15px",
        }}
        defaultValue={defaultValue}
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

  return (
    <div>
      <div
        style={{
          background: theme.custom.colors.bg2,
          width: 200,
          boxShadow:
            "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
          borderRadius: "12px",
          marginLeft: 10,
          marginRight: 10,
          marginBottom: 4,
          padding: activeSearch && 12,
        }}
      >
        {shownResults.map((item, index) => (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              padding: 8,
              cursor: "pointer",
              background:
                index === cursor ? "#1264a3" : theme.custom.colors.background,
              color: index === cursor ? "#fff" : theme.custom.colors.fontColor,
              width: 180,
              textAlign: "left",
              border: "none",
              backgroundColor: "transparent",
            }}
            key={item.index}
            onClick={() => {
              selectItem(item);
            }}
          >
            <img
              style={{ height: 26, borderRadius: 12, marginRight: 5 }}
              src={users[item.id]?.image}
            />
            <div
              style={{
                fontSize: 15,
                color: theme.custom.colors.fontColor2,
                fontWeight: 500,
              }}
            >
              @{item.name}
            </div>
          </button>
        ))}
        {activeSearch !== "" &&
          activeSearch &&
          activeSearch.length !== 0 &&
          loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: "transparent",
                marginBottom: 3,
                paddingTop: 3,
                width: 180,
              }}
            >
              <CircularProgress size={20} />
            </div>
          )}
      </div>
    </div>
  );
};
