import { useEffect, useState } from "react";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { UserList } from "@coral-xyz/message-sdk";
import { Loading, TextInput } from "@coral-xyz/react-common";

import { useNavStack } from "../../common/Layout/NavStack";

import { SearchUsers } from "./SearchUsers";
import { useStyles } from "./styles";

export const Requests = () => {
  const classes = useStyles();
  const [requests, setRequests] = useState<RemoteUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState("");
  const filteredRequests = requests
    .filter((x) => x.username.includes(searchFilter))
    .map((x: RemoteUserData) => ({
      image: x.image,
      //@ts-ignore -- remove uuid
      id: x.id || x.uuid,
      username: x.username,
      areFriends: x.areFriends,
      requested: x.requested,
      remoteRequested: x.remoteRequested,
    }));
  const nav = useNavStack();

  const fetchRequests = async () => {
    const response = await fetch(`${BACKEND_API_URL}/friends/requests`, {
      method: "GET",
    });
    try {
      const json = await response.json();
      setRequests(json.requests);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    nav.setTitle("Requests");
  }, [nav]);

  if (loading) {
    return <Loading />;
  }

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
      {filteredRequests.length !== 0 && (
        <UserList
          setMembers={setRequests}
          users={filteredRequests as RemoteUserData[]}
        />
      )}
    </div>
  );
};
