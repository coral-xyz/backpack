import { useEffect, useState } from "react";
import type {
  CollectionChatData,
  EnrichedInboxDb,
  RemoteUserData,
} from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { BubbleTopLabel, EmptyState, SearchBox } from "@coral-xyz/react-common";
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

let debouncedTimer: ReturnType<typeof setTimeout>;

export function Inbox() {
  return <InboxInner />;
}

export function InboxInner() {
  const classes = useStyles();
  const user = useUser();
  const { uuid } = user;
  const activeChats = useFriendships({ uuid });
  const requestCount = useRequestsCount({ uuid });
  const groupCollections = useGroupCollections({ uuid });
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const [searchFilter, setSearchFilter] = useState("");

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
  ];

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

  const debouncedInit = (prefix: string) => {
    clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(async () => {
      await handleContactSearch(prefix);
    }, 250);
  };

  const handleContactSearch = async (searchFilter: string) => {
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

  useEffect(() => {
    setSearchFilter("");
  }, [uuid]);

  return (
    <div
      className={classes.container}
      style={{
        //        marginTop: "8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SearchBox
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        onChange={async (prefix: string) => {
          debouncedInit(prefix);
        }}
      />
      {!allChats || !allChats.length ? <MessagesSkeleton /> : null}
      {allChats &&
      allChats.length !== 0 &&
      (allChats.filter((x) =>
        (x.chatType === "individual"
          ? x.chatProps.remoteUsername || ""
          : x.chatProps.name
        )?.includes(searchFilter)
      ).length > 0 ||
        requestCount > 0) ? (
          <>
            {searchFilter.length >= 3 ? (
              <BubbleTopLabel text="Your friends" />
          ) : null}
            <div style={{ paddingBottom: "16px" }}>
              <MessageList
                requestCount={searchFilter.length < 3 ? requestCount : 0}
                activeChats={allChats.filter((x) => {
                const displayName =
                  x.chatType === "individual"
                    ? x.chatProps.remoteUsername
                    : x.chatProps.name;
                if (displayName?.includes(searchFilter)) {
                  return true;
                }
                if (
                  x.chatType === "individual" &&
                  x.chatProps.public_keys
                    ?.map((x) => x.publicKey)
                    ?.includes(searchFilter)
                ) {
                  return true;
                }
                return false;
              })}
            />
            </div>
          </>
      ) : null}
      {searchFilter.length >= 3 && searchedUsersDistinct.length !== 0 ? (
        <>
          <BubbleTopLabel text="Other people" />
          <UserList
            users={searchedUsersDistinct}
            setMembers={setSearchResults}
          />
        </>
      ) : null}
      {allChats &&
      allChats.length !== 0 &&
      searchFilter.length < 3 &&
      requestCount === 0 &&
      allChats.length === 0 ? (
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
            title="No messages"
            subtitle="Search for someone to send a message!"
          />
        </div>
      ) : null}
    </div>
  );
}
