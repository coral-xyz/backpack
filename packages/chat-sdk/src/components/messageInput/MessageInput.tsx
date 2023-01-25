import { Fragment, useContext, useEffect, useRef, useState } from "react";
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

export const CustomAutoComplete = ({
  offlineMembers,
}: {
  offlineMembers: { username: string; uuid: string; image: string }[];
}) => {
  const theme = useCustomTheme();
  const { loading, results, activeSearch, selectItem } =
    useContext(RichMentionsContext);

  const users = useUsersMetadata({ remoteUserIds: results.map((r) => r.id) });

  return (
    <div>
      {activeSearch !== "" && activeSearch && activeSearch.length !== 0 && (
        <div>
          {" "}
          {offlineMembers
            .filter((x) => x.username.includes(activeSearch.slice(1)))
            .map((item) => (
              <button
                style={{
                  display: "flex",
                  padding: 8,
                  cursor: "pointer",
                  width: "100%",
                  background: theme.custom.colors.background,
                  color: theme.custom.colors.fontColor,
                  textAlign: "left",
                  border: "none",
                  boxShadow: `${theme.custom.colors.boxShadow}`,
                }}
                key={item.uuid}
                onClick={() => {
                  selectItem({
                    name: item.username,
                    id: item.uuid,
                    ref: `<@${item.username}|u${item.uuid}>`,
                  });
                }}
              >
                <img
                  style={{ height: 20, borderRadius: 10, marginRight: 5 }}
                  src={item.image}
                />
                <div style={{ fontSize: 15 }}>{item.username}</div>
              </button>
            ))}
        </div>
      )}

      {results
        .filter((x) => !offlineMembers.map((x) => x.uuid).includes(x.id))
        .map((item, i) => (
          <button
            style={{
              padding: 8,
              display: "flex",
              cursor: "pointer",
              width: "100%",
              background: theme.custom.colors.background,
              color: theme.custom.colors.fontColor,
              border: "none",
              boxShadow: `${theme.custom.colors.boxShadow}`,
              textAlign: "left",
            }}
            key={item.ref}
            onClick={() => {
              selectItem(item);
            }}
          >
            <img
              style={{ height: 20, borderRadius: 10, marginRight: 5 }}
              src={users[item.id]?.image}
            />
            <div style={{ fontSize: 15 }}>{item.name}</div>
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
      ) : (
        <></>
      )}
    </div>
  );
};
