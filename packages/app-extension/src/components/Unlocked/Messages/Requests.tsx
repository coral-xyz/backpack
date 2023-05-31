import { useEffect, useState } from "react";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { UserList } from "@coral-xyz/message-sdk";
import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";

export const Requests = ({ searchFilter }: { searchFilter: string }) => {
  const [requests, setRequests] = useState<RemoteUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useCustomTheme();

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

  if (loading) {
    return (
      <div style={{ marginTop: 5 }}>
        {" "}
        <SkeletonContainer />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 5 }}>
      {filteredRequests.length !== 0 ? (
        <UserList
          setMembers={setRequests}
          users={filteredRequests as RemoteUserData[]}
        />
      ) : null}
      {filteredRequests.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ color: theme.custom.colors.fontColor }}>
            You have no pending requests
          </div>
        </div>
      ) : null}
    </div>
  );
};

function SkeletonContainer() {
  return (
    <>
      <UserSkeleton isFirst isLast={false} />
      <UserSkeleton isFirst={false} isLast={false} />
      <UserSkeleton isFirst={false} isLast={false} />
      <UserSkeleton isFirst={false} isLast />
    </>
  );
}

function UserSkeleton({
  isFirst,
  isLast,
}: {
  isFirst: boolean;
  isLast: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <div
      onClick={() => {}}
      style={{
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "12px",
        height: 48,
        paddingBottom: "12px",
        display: "flex",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div>
          <Skeleton variant="circular" width={32} height={32} />
        </div>
        <div
          style={{
            marginLeft: "5px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <Skeleton width="80px" height={35} style={{ marginTop: "-6px" }} />
          <Skeleton width="70px" height={35} style={{ marginTop: "-6px" }} />
        </div>
      </div>
    </div>
  );
}
