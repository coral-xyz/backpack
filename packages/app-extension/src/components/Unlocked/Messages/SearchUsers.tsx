import { useEffect, useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";

import { TextInput } from "../../common/Inputs";

import { useStyles } from "./styles";
import { UserList } from "./UserList";

export const SearchUsers = () => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contacts, setContacts] = useState<EnrichedInboxDb[]>([]);
  const filteredContacts = contacts
    .filter((x: EnrichedInboxDb) => x.remoteUsername.includes(searchFilter))
    .map((x: EnrichedInboxDb) => ({
      image: x.remoteUserImage,
      id: x.remoteUserId,
      username: x.remoteUsername,
    }));

  const fetchFriends = async () => {
    const res = await fetch(`${BACKEND_API_URL}/friends/all`);
    const json = await res.json();
    setContactsLoading(false);
    const chats: EnrichedInboxDb[] = json.chats;
    setContacts(chats || []);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

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
      {filteredContacts.length !== 0 && <UserList users={filteredContacts} />}
    </div>
  );
};
