import { useEffect, useState } from "react";
import type { EnrichedInboxDb, RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import { UserList } from "@coral-xyz/message-sdk";
import { TextInput } from "@coral-xyz/react-common";
import { useFriendships, useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { useNavStack } from "../../common/Layout/NavStack";

import { Requests } from "./Requests";
import { useStyles } from "./styles";

export const SearchUsers = () => {
  const { uuid } = useUser();
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const allChats = useContacts(uuid);
  const contacts = allChats.filter((x: any) => x.areFriends === 1);
  const theme = useCustomTheme();

  const filteredContacts = contacts
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
      areFriends: x.areFriends ? true : false,
    }));

  return (
    <div className={classes.container}>
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
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
      {filteredContacts.length !== 0 && (
        <UserList users={filteredContacts as RemoteUserData[]} />
      )}
      <br />
      <div style={{ color: theme.custom.colors.fontColor }}>Requests</div>
      <Requests searchFilter={searchFilter} />
    </div>
  );
};
