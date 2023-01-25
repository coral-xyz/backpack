import { useEffect, useState } from "react";
import { SearchBox } from "@coral-xyz/app-extension/src/components/Unlocked/Messages/SearchBox";
import type {
  CollectionChatData,
  EnrichedInboxDb,
  RemoteUserData,
} from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import {
  EmptyState,
  refreshGroupsAndFriendships,
} from "@coral-xyz/react-common";
import {
  useFriendships,
  useGroupCollections,
  useRequestsCount,
  useUser,
} from "@coral-xyz/recoil";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { MessageList } from "./MessageList";
import { MessagesSkeleton } from "./MessagesSkeleton";
import { useStyles } from "./styles";
import { UserList } from "./UserList";

let debouncedTimer;

export function Inbox() {
  return <InboxInner />;
}

export function InboxInner() {
  const classes = useStyles();
  const { uuid } = useUser();
  const activeChats = useFriendships({ uuid });
  const requestCount = useRequestsCount({ uuid });
  const groupCollections = useGroupCollections({ uuid });
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [refreshing, setRefreshing] = useState(true);

  const getDefaultChats = () => {
    return groupCollections.filter((x) => x.name && x.image) || [];
  };

  const allChats: (
    | { chatType: "individual"; chatProps: EnrichedInboxDb }
    | { chatType: "collection"; chatProps: CollectionChatData }
  )[] = [
    ...getDefaultChats().map((x) => ({ chatProps: x, chatType: "collection" })),
    ...(activeChats || []).map((x) => ({
      chatProps: x,
      chatType: "individual",
    })),
  ].sort((a, b) =>
    a.last_message_timestamp < b.last_message_timestamp ? -1 : 1
  );

  const searchedUsersDistinct = searchResults.filter(
    (result) =>
      !allChats
        ?.map((x) =>
          x.chatType === "collection"
            ? x.chatProps.name
            : x.chatProps.remoteUsername
        )
        .includes(result.username)
  );

  useEffect(() => {
    refreshGroupsAndFriendships(uuid);
  }, [uuid]);

  const debouncedInit = () => {
    clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(() => {
      handleContactSearch();
    }, 250);
  };

  const handleContactSearch = async () => {
    if (searchFilter.length > 1) {
      const response = await ParentCommunicationManager.getInstance().fetch(
        `${BACKEND_API_URL}/users?usernamePrefix=${searchFilter}`
      );
      const json = await response.json();
      setSearchResults(
        json.users.sort((a, b) =>
          a.username.length < b.username.length ? -1 : 1
        ) || []
      );
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div
      className={classes.container}
      style={{ marginTop: "8px", display: "flex", flexDirection: "column" }}
    >
      <SearchBox
        onChange={async (prefix: string) => {
          setSearchFilter(prefix);
          debouncedInit();
        }}
      />
      {(!allChats || (refreshing && !allChats.length)) && <MessagesSkeleton />}
      {allChats &&
        (allChats.length || !refreshing) &&
        (allChats.filter((x) =>
          (x.chatType === "individual"
            ? x.chatProps.remoteUsername || ""
            : x.chatProps.name
          )?.includes(searchFilter)
        ).length > 0 ||
          requestCount > 0) && (
          <>
            {searchFilter.length >= 3 && (
              <div className={classes.topLabel}>Your contacts</div>
            )}
            <MessageList
              requestCount={searchFilter.length < 3 ? requestCount : 0}
              activeChats={allChats.filter((x) =>
                (x.chatType === "individual"
                  ? x.chatProps.remoteUsername
                  : x.chatProps.name
                )?.includes(searchFilter)
              )}
            />
          </>
        )}
      {searchFilter.length >= 3 && searchedUsersDistinct.length !== 0 && (
        <div style={{ marginTop: 30 }}>
          <div className={classes.topLabel}>Other people</div>
          <UserList
            users={searchedUsersDistinct}
            setMembers={setSearchResults}
          />
        </div>
      )}
      {allChats &&
        (allChats.length || !refreshing) &&
        searchFilter.length < 3 &&
        requestCount === 0 &&
        allChats.length === 0 && (
          <div
            style={{
              flexGrow: 1,
              justifyContent: "center",
              flexDirection: "column",
              display: "flex",
              paddingBottom: 50,
            }}
          >
            {" "}
            <EmptyState
              icon={(props: any) => <ChatBubbleIcon {...props} />}
              title={"No messages"}
              subtitle={"Search for someone to send a message!"}
            />
          </div>
        )}
    </div>
  );
}
