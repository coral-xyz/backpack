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
    <>
      {parts.map((part) => {
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
              <span
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
                  color: theme.custom.colors.blue,
                }}
              >
                {handle}
              </span>
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
    </>
  );
}
