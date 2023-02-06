import React from "react";
import { NAV_COMPONENT_MESSAGE_CHAT, parseMessage } from "@coral-xyz/common";
import { useNavigation } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import Linkify from "linkify-react";

import { useChatContext } from "./ChatContext";

export function ParsedMessage({ message }) {
  const { push } = useNavigation();
  const parts = parseMessage(message);
  const theme = useCustomTheme();
  const { usersMetadata } = useChatContext();
  return (
    <div style={{ display: "flex" }}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <span style={{ wordBreak: "break-word" }}>
              <Linkify options={{ target: "_blank" }}>{part.value}</Linkify>
            </span>
          );
        } else {
          const user = usersMetadata[part.value];
          if (user) {
            const handle = `@${user.username}`;
            return (
              <div
                onClick={() => {
                  push({
                    title: `@${user.username}`,
                    componentId: NAV_COMPONENT_MESSAGE_CHAT,
                    componentProps: {
                      userId: user.uuid,
                      username: user.username,
                    },
                  });
                }}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  color: theme.custom.colors.blue,
                }}
              >
                <div>
                  {i > 0 && <>&nbsp;</>}
                  {handle}
                  {i < parts.length - 1 && <>&nbsp;</>}
                </div>
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
