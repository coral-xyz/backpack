import { useEffect, useState } from "react";
import type { EnrichedInboxDb } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";

import { TextInput } from "../../common/Inputs";

import { useStyles } from "./styles";
import { UserList } from "./UserList";

export const SearchUsers = ({
  title,
  onlyContacts,
}: {
  title: string;
  onlyContacts: boolean;
}) => {
  const classes = useStyles();
  const [searchFilter, setSearchFilter] = useState("");
  const [searchResults, setSearchResults] = useState<
    { image: string; id: string; username: string }[]
  >([]);
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
      {title && <div className={classes.text}>{title}</div>}
      <TextInput
        className={classes.searchField}
        placeholder={"Search"}
        value={searchFilter}
        setValue={async (e) => {
          const prefix = e.target.value;
          setSearchFilter(prefix);
          if (onlyContacts) {
            return;
          }
          if (prefix.length >= 3) {
            //TODO debounce
            const res = await fetch(
              `${BACKEND_API_URL}/users?usernamePrefix=${prefix}`
            );
            const json = await res.json();
            setSearchResults(json.users || []);
          } else {
            setSearchResults([]);
          }
        }}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      {filteredContacts.length !== 0 && <UserList users={filteredContacts} />}
      <br />
      {searchResults.length !== 0 && <UserList users={searchResults} />}
    </div>
  );
};
