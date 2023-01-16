import { useEffect, useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useRequests } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { EmptyRequests } from "./EmptyRequests";
import { MessageList } from "./MessageList";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { useStyles } from "./styles";

export const RequestsScreen = () => {
  const { uuid } = useUser();
  const activeChats = useRequests(uuid) || [];
  const classes = useStyles();

  return (
    <div
      className={classes.container}
      style={{ display: "flex", flexDirection: "column" }}
    >
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
