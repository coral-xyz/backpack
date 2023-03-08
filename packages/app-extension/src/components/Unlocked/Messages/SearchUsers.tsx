import { useState } from "react";
import type { EnrichedInboxDb, RemoteUserData } from "@coral-xyz/common";
import { UserList } from "@coral-xyz/message-sdk";
import {
  BubbleTopLabel,
  ContactsIcon,
  EmptyState,
  TextInput,
} from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import SearchIcon from "@mui/icons-material/Search";
import { Typography } from "@mui/material";

import { useNavigation } from "../../common/Layout/NavStack";

// import { Requests } from "./Requests";
import { useStyles } from "./styles";

export const SearchUsers = ({
  allChats,
  requests,
}: {
  allChats: EnrichedInboxDb[];
  requests: { received: RemoteUserData[]; sent: RemoteUserData[] };
}) => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const friends = allChats.filter((x: any) => x.areFriends === 1);
  const theme = useCustomTheme();

  const filteredFriends = friends
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
      areFriends: x.areFriends ? true : false,
      requested: x.requested ? true : false,
      remoteRequested: x.remoteRequested ? true : false,
    }));

  return (
    <div className={classes.container}>
      <TextInput
        className={classes.searchField}
        placeholder="Search"
        startAdornment={
          <SearchIcon sx={{ color: theme.custom.colors.icon, mr: "10px" }} />
        }
        value={searchFilter}
        setValue={async (e) => {
          const prefix = e.target.value;
          setSearchFilter(prefix);
        }}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      {filteredFriends.length > 0 ? (
        <div style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <BubbleTopLabel text="Your friends" />
            {requests.received.length > 0 ? (
              <RequestHeader requests={requests} />
            ) : null}
          </div>
          <div style={{ marginBottom: 15 }}>
            <UserList users={filteredFriends as RemoteUserData[]} />
          </div>
        </div>
      ) : (
        <>
          {requests.received.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                marginBottom: "8px",
                marginTop: "24px",
              }}
            >
              <RequestHeader requests={requests} />
            </div>
          ) : null}
          <EmptyState
            icon={(props: any) => (
              <ContactsIcon fill={theme.custom.colors.icon} {...props} />
            )}
            title={
              searchFilter === ""
                ? "No friends"
                : `No results for '${searchFilter}'`
            }
            subtitle={
              searchFilter === ""
                ? "Request users to become friends in the messaging tab"
                : ""
            }
            style={{ paddingLeft: 0, paddingRight: 0, marginTop: "24px" }}
          />
        </>
      )}
    </div>
  );
};

const RequestHeader = ({
  requests,
}: {
  requests: { received: RemoteUserData[]; sent: RemoteUserData[] };
}) => {
  const theme = useCustomTheme();
  const nav = useNavigation();
  return (
    <div
      style={{
        marginLeft: "4px",
        display: "flex",
        flexDirection: "row-reverse",
      }}
    >
      <Typography
        sx={{ cursor: "pointer" }}
        color={theme.custom.colors.fontColor3}
        fontSize={14}
        onClick={() =>
          nav.push("contact-requests", {
            description: (
              <>
                These people wanted to add you as a friend.
                <br /> Click someone to view their profile.
              </>
            ),
            requests,
          })
        }
      >
        Request{requests.received.length > 1 ? "s" : ""} (
        {requests.received.length})
      </Typography>
    </div>
  );
};
