import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useBreakpoints } from "@coral-xyz/app-extension/src/components/common/Layout/hooks";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  NAV_COMPONENT_MESSAGE_CHAT,
  NAV_COMPONENT_MESSAGE_GROUP_CHAT,
} from "@coral-xyz/common";
import { useRequests } from "@coral-xyz/db";
import {
  requestsOpen,
  useDecodedSearchParams,
  useNavigation,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRecoilState } from "recoil";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { EmptyRequests } from "./EmptyRequests";
import { MessageList } from "./MessageList";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { useStyles } from "./styles";

export const RequestsScreen = () => {
  const { uuid } = useUser();
  const activeChats = useRequests(uuid) || [];
  const theme = useCustomTheme();
  const classes = useStyles();
  const { isXs } = useBreakpoints();
  const [_, setRequestsOpen] = useRecoilState(requestsOpen);

  return (
    <div
      className={classes.container}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div>
        {!isXs && <br />}
        <div style={{ display: "flex" }}>
          <ArrowBackIcon
            onClick={() => {
              setRequestsOpen(false);
            }}
            style={{ color: theme.custom.colors.icon, cursor: "pointer" }}
          />
          <div
            style={{
              color: theme.custom.colors.fontColor,
              flex: 1,
              textAlign: "center",
              marginRight: 10,
              fontSize: 18,
            }}
          >
            Requests
          </div>
        </div>
      </div>
      <div
        className={classes.smallTitle2}
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          margin: 15,
        }}
      >
        These are not from your contacts. Click into a message to reply or view
        their profile.
      </div>
      {activeChats.length !== 0 && (
        <MessageList
          activeChats={activeChats.map((x) => ({
            chatType: "individual",
            chatProps: x,
          }))}
        />
      )}
      {activeChats.length === 0 && <EmptyRequests />}
    </div>
  );
};
