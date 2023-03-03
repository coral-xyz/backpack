import { type ReactNode, useEffect, useState } from "react";
import { type RemoteUserData, BACKEND_API_URL } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import { UserList } from "@coral-xyz/message-sdk";
import { useUser } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { useNavigation } from "../../common/Layout/NavStack";

import { SearchUsers } from "./SearchUsers";
import { useStyles } from "./styles";

async function getRequests(): Promise<{
  received: RemoteUserData[];
  sent: RemoteUserData[];
}> {
  const [received, sent] = await Promise.all([
    fetch(`${BACKEND_API_URL}/friends/requests`).then((res) => res.json()),
    fetch(`${BACKEND_API_URL}/friends/sent`).then((res) => res.json()),
  ]);

  return { received: received.requests, sent: sent.requests };
}

export const Contacts = () => {
  const nav = useNavigation();
  const { uuid } = useUser();
  const allChats = useContacts(uuid);
  const [requests, setRequests] = useState<
    Record<"received" | "sent", RemoteUserData[]>
  >({ received: [], sent: [] });

  useEffect(() => {
    getRequests().then(setRequests).catch(console.error);
  }, []);

  useEffect(() => {
    nav.setOptions({ headerTitle: "Friends" });
  }, [nav]);

  return (
    <div>
      <SearchUsers allChats={allChats} requests={requests} />
    </div>
  );
};

export const ContactRequests = ({
  description,
  isSent,
  requests,
}: {
  description: ReactNode;
  isSent?: boolean;
  requests: { received: RemoteUserData[]; sent: RemoteUserData[] };
}) => {
  const nav = useNavigation();
  const classes = useStyles();
  const theme = useCustomTheme();
  const [localSentRequests, setLocalSentRequests] = useState<RemoteUserData[]>(
    []
  );
  const [localReceivedRequests, setLocalReceivedRequests] = useState<
    RemoteUserData[]
  >([]);

  useEffect(() => {
    setLocalReceivedRequests(requests.received);
    setLocalSentRequests(requests.sent);
  }, [requests]);

  useEffect(() => {
    nav.setOptions({ headerTitle: `Requests ${isSent ? "Sent" : "Received"}` });
  }, [nav]);

  return (
    <div className={classes.container}>
      <Typography
        sx={{ mt: "24px", mb: "16px", textAlign: "center" }}
        fontSize={14}
        color={theme.custom.colors.fontColor3}
      >
        {description}
      </Typography>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {!isSent && requests.sent.length > 0 ? <Typography
          sx={{ cursor: "pointer", alignSelf: "flex-end", mb: "8px" }}
          fontSize={14}
          fontWeight={600}
          color={theme.custom.colors.fontColor3}
          onClick={() =>
              nav.push("contact-requests-sent", {
                description: (
                  <>
                    People you added as friends.
                    <br /> Click someone to view their profile.
                  </>
                ),
                isSent: true,
                requests,
              })
            }
          >
          Sent ({requests.sent.length})
        </Typography> : null}
        <UserList
          setMembers={isSent ? setLocalSentRequests : setLocalReceivedRequests}
          users={isSent ? localSentRequests : localReceivedRequests}
        />
      </div>
    </div>
  );
};
