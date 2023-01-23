import React from "react";
import { NAV_COMPONENT_MESSAGE_PROFILE, parseMessage } from "@coral-xyz/common";
import { useUsersFromUuids } from "@coral-xyz/db";
import { useNavigation, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import Linkify from "linkify-react";

export function ParsedMessage({ message }) {
  const { uuid } = useUser();
  const { push } = useNavigation();
  const parts = parseMessage(message);
  const theme = useCustomTheme();
  const users = useUsersFromUuids(
    uuid,
    parts.filter((x) => x.type === "tag").map((x) => x.value)
  );
  return (
    <div style={{ display: "flex" }}>
      {parts.map((part) => {
        if (part.type === "text") {
          return (
            <span style={{ wordBreak: "break-word" }}>
              <Linkify options={{ target: "_blank" }}>{part.value}</Linkify>
            </span>
          );
        } else {
          const user = users?.find((x) => x?.uuid === part.value);
          if (user) {
            return (
              <div
                onClick={() => {
                  push({
                    title: `@${user.username}`,
                    componentId: NAV_COMPONENT_MESSAGE_PROFILE,
                    componentProps: {
                      userId: user.uuid,
                    },
                  });
                }}
                style={{
                  marginLeft: 3,
                  cursor: "pointer",
                  display: "flex",
                  color: theme.custom.colors.blue,
                }}
              >
                <img
                  style={{
                    height: 16,
                    borderRadius: 8,
                    marginTop: 3,
                    marginRight: 1,
                  }}
                  src={`${user.image}?size=25`}
                />
                <div>{user.username}</div>
              </div>
            );
          } else {
            return (
              <div style={{ display: "flex" }}>
                <Skeleton
                  style={{ marginTop: 3, marginLeft: 3, marginRight: 1 }}
                  variant="circular"
                  width={15}
                  height={15}
                />
                <Skeleton width={30} height={20} style={{ marginTop: "0px" }} />
              </div>
            );
          }
        }
      })}
    </div>
  );
}
