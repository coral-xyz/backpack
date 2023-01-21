import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { RichMentionsContext, RichMentionsInput } from "react-rich-mentions";
import { useUsersFromUuids } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { CircularProgress } from "@mui/material";

export function MessageInput({ inputRef }: { inputRef: any }) {
  const defaultValue = "";

  return (
    <div style={{ width: "100%" }}>
      <RichMentionsInput
        style={{ outline: "0px solid transparent", marginTop: 2 }}
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
  const {
    opened,
    index,
    loading,
    results,
    activeSearch,
    setActiveItemIndex,
    selectItem,
    setPositionFixed,
  } = useContext(RichMentionsContext);

  const { uuid } = useUser();
  const users = useUsersFromUuids(
    uuid,
    results.map((r) => r.id)
  );

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
                  padding: 5,
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
                  style={{ height: 16, borderRadius: 8, marginRight: 5 }}
                  src={item.image}
                />
                <div style={{ marginBottom: 3 }}>{item.username}</div>
              </button>
            ))}
        </div>
      )}

      {results
        .filter((x) => !offlineMembers.map((x) => x.uuid).includes(x.id))
        .map((item, i) => (
          <button
            style={{
              padding: 5,
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
              style={{ height: 16, borderRadius: 8, marginRight: 5 }}
              src={users.find((x) => x?.uuid === item.id)?.image}
            />
            <div style={{ marginBottom: 3 }}>{item.name}</div>
          </button>
        ))}
      {activeSearch !== "" &&
      activeSearch &&
      activeSearch.length !== 0 &&
      loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 3 }}
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
