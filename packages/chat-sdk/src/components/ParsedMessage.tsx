import {
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_PROFILE,
  NEW_COLORS,
  parseMessage,
} from "@coral-xyz/common";
import { useDarkMode, useNavigation, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";
import Linkify from "linkify-react";

import { useChatContext } from "./ChatContext";

export function ParsedMessage({ message }) {
  const { push } = useNavigation();
  const parts = parseMessage(message);
  const theme = useCustomTheme();
  const { usersMetadata, type } = useChatContext();
  const { uuid } = useUser();
  const isDarkMode = useDarkMode();
  return (
    <>
      {parts.map((part) => {
        if (part.type === "text") {
          return (
            <span style={{ wordBreak: "break-word" }}>
              {/*<Linkify*/}
              {/*  options={{*/}
              {/*    target: "_blank",*/}
              {/*    render: {*/}
              {/*      url: ({ attributes, content }) => {*/}
              {/*        return (*/}
              {/*          <a*/}
              {/*            {...attributes}*/}
              {/*            style={{ color: theme.custom.colors.linkColor }}*/}
              {/*          >*/}
              {/*            {content}*/}
              {/*          </a>*/}
              {/*        );*/}
              {/*      },*/}
              {/*    },*/}
              {/*  }}*/}
              {/*>*/}
              {part.value}
              {/*</Linkify>*/}
            </span>
          );
        } else {
          const user = usersMetadata[part.value];
          if (user) {
            const handle = `@${user.username}`;
            return (
              <span
                onClick={() => {
                  if (user.uuid === uuid) {
                    return;
                  }
                  push({
                    title: `@${user.username}`,
                    componentId:
                      type === "individual"
                        ? NAV_COMPONENT_MESSAGE_PROFILE
                        : NAV_COMPONENT_MESSAGE_CHAT,
                    componentProps: {
                      userId: user.uuid,
                      title: `@${user.username}`,
                    },
                  });
                }}
                style={{
                  cursor: "pointer",
                  color:
                    user.colorIndex || user.colorIndex === 0
                      ? NEW_COLORS[user.colorIndex || 0][
                          isDarkMode ? "dark" : "light"
                        ]
                      : user.color,
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
