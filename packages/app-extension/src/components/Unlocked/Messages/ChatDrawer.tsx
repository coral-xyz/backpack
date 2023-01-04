import { useEffect, useState } from "react";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { UserList } from "@coral-xyz/message-sdk";
import {
  useActiveSolanaWallet,
  useDecodedSearchParams,
} from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { Drawer, Typography } from "@mui/material";

import { SearchBox } from "./SearchBox";
import { UserListSkeleton } from "./UserListSkeleton";

export const useStyles = styles((theme) => ({
  container: {
    padding: 0,
    backgroundColor: `${theme.custom.colors.nav}`,
    color: theme.custom.colors.fontColor2,
  },
  icon: {
    color: theme.custom.colors.icon,
    marginRight: 10,
    height: "24px",
    width: "24px",
  },
  horizontalCenter: {
    justifyContent: "center",
    display: "flex",
  },
  title: {
    marginTop: 20,
    marginBottom: 20,
  },
  drawerContainer: {
    padding: 10,
    height: "80vh",
  },
  drawer: {
    "& .MuiDrawer-paper": {
      borderTopLeftRadius: "15px",
      borderTopRightRadius: "15px",
    },
  },
}));

export const ChatDrawer = ({ setOpenDrawer }: { setOpenDrawer: any }) => {
  const classes = useStyles();
  const [offset, setOffset] = useState(0);
  const { props }: any = useDecodedSearchParams();
  const { publicKey } = useActiveSolanaWallet();
  const [members, setMembers] = useState<RemoteUserData[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [staticMembers, setStaticMembers] = useState<RemoteUserData[]>([]);

  const init = async (prefix = "") => {
    const response = await fetch(
      `${BACKEND_API_URL}/nft/members?room=${props.collectionId}&mint=${props.nftMint}&publicKey=${publicKey}&type=collection&limit=20&offset=${offset}&prefix=${prefix}`,
      {
        method: "GET",
      }
    );
    const json = await response.json();
    setMembers(json.members);
    setCount(json.count);
    setLoading(false);
    setStaticMembers((members) => {
      if (members.length === 0) {
        return json.members.slice(0, 4);
      }
      return members;
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Drawer
      className={classes.drawer}
      anchor={"bottom"}
      open={true}
      onClose={() => setOpenDrawer(false)}
    >
      <div className={classes.drawerContainer}>
        <div className={classes.horizontalCenter}>
          <Typography variant={"h5"} className={classes.title}>
            {props.title}
          </Typography>
        </div>
        {loading && <UserListSkeleton />}
        {!loading && (
          <>
            {count && <MembersList count={count} members={staticMembers} />}
            <SearchBox
              onChange={(prefix: string) => {
                if (prefix.length >= 3) {
                  init(prefix);
                }
                setSearchFilter(prefix);
              }}
            />
            <div className={classes.container}>
              <UserList
                setMembers={setMembers}
                users={members.filter((x) =>
                  x.username
                    ?.toLocaleLowerCase()
                    .includes(searchFilter?.toLocaleLowerCase())
                )}
              />
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};

function MembersList({
  count,
  members,
}: {
  count: number;
  members: RemoteUserData[];
}) {
  return (
    <div style={{ justifyContent: "center", display: "flex" }}>
      {members.map((member) => (
        <img src={member.image} style={{ height: 20 }} />
      ))}
      {count} members
    </div>
  );
}
