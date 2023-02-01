import { useEffect, useState } from "react";
import { type RemoteUserData,BACKEND_API_URL } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import { UserList } from "@coral-xyz/message-sdk";
import { useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { useNavStack } from "../../common/Layout/NavStack";

import { SearchUsers } from "./SearchUsers";
import { useStyles } from "./styles";

async function getRequests(): Promise<RemoteUserData[]> {
  const response = await fetch(`${BACKEND_API_URL}/friends/requests`);
  const json = await response.json();
  return json.requests;
}

export const Contacts = () => {
  const nav = useNavStack();
  const { uuid } = useUser();
  const allChats = useContacts(uuid);
  const [requests, setRequests] = useState<RemoteUserData[]>([]);

  useEffect(() => {
    getRequests().then(setRequests).catch(console.error);
  }, []);

  useEffect(() => {
    nav.setTitle("Contacts");
  }, [nav]);

  return (
    <div>
      <SearchUsers allChats={allChats} requests={requests} />
    </div>
  );
};

export const ContactRequests = ({
  requests,
}: {
  requests: RemoteUserData[];
}) => {
  const nav = useNavStack();
  const classes = useStyles();
  const theme = useCustomTheme();

  useEffect(() => {
    nav.setTitle("Requests Received");
  }, [nav]);

  const received = requests.filter((r) => r.remoteRequested);
  const sent = requests.filter((r) => r.requested);

  return (
    <div className={classes.container}>
      <Typography
        sx={{ mt: "24px", mb: "16px", textAlign: "center" }}
        fontSize={14}
        color={theme.custom.colors.fontColor3}
      >
        These people wanted to add you as a contact.
        <br />
        Click someone to view their profile.
      </Typography>
      <div>
        {sent.length > 0 && (
          <Typography
            sx={{ cursor: "pointer", float: "right" }}
            fontSize={14}
            color={theme.custom.colors.fontColor3}
            onClick={() => {}}
          >
            Sent ({sent.length})
          </Typography>
        )}
        <UserList users={received} />
      </div>
    </div>
  );
};
