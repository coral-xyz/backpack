import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { UserList } from "@coral-xyz/message-sdk";
import {
  useActiveSolanaWallet,
  useDecodedSearchParams,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Drawer, Typography } from "@mui/material";

import { SearchBox } from "./SearchBox";
import { UserListSkeleton } from "./UserListSkeleton";

const LIMIT = 25;
let debouncedTimer = 0;

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
    color: theme.custom.colors.fontColor4,
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
  const { props, title }: any = useDecodedSearchParams();
  const { publicKey } = useActiveSolanaWallet();
  const [members, setMembers] = useState<RemoteUserData[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [staticMembers, setStaticMembers] = useState<RemoteUserData[]>([]);
  const theme = useCustomTheme();
  const pathname = useLocation().pathname;

  const debouncedInit = (prefix: string, offset: number) => {
    clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(() => {
      init(prefix, offset);
    }, 250);
  };

  const init = async (prefix = "", offset = 0) => {
    setLoading(true);
    setOffset(offset);
    const response = await fetch(
      `${BACKEND_API_URL}/nft/members?room=${
        pathname === "/messages/groupchat" ? props.id : props.collectionId
      }&mint=${
        props.nftMint
      }&publicKey=${publicKey}&type=collection&limit=${LIMIT}&offset=${offset}&prefix=${prefix}`,
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
    setLoading(false);
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
            {props.title || title}
          </Typography>
        </div>
        {count !== 0 && <MembersList count={count} members={staticMembers} />}
        <SearchBox
          onChange={(prefix: string) => {
            setSearchFilter(prefix);
            debouncedInit(prefix, 0);
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: theme.custom.colors.smallTextColor,
          }}
        >
          <div
            style={{ padding: 5, cursor: "pointer" }}
            onClick={() => {
              debouncedInit(searchFilter, Math.max(offset - 1, 0));
            }}
          >
            {offset !== 0 ? "Prev" : ""}
          </div>
          {/* TODO: clean up this logic */}
          {members.length === LIMIT && (
            <div
              style={{ padding: 5, cursor: "pointer" }}
              onClick={() => {
                debouncedInit(searchFilter, offset + 1);
              }}
            >
              Next
            </div>
          )}
        </div>

        {loading && <UserListSkeleton />}
        {!loading && (
          <>
            <div className={classes.container}>
              {members.filter((x) =>
                x.username
                  ?.toLocaleLowerCase()
                  .includes(searchFilter?.toLocaleLowerCase())
              ).length !== 0 ? (
                <UserList
                  setMembers={setMembers}
                  users={members.filter((x) =>
                    x.username
                      ?.toLocaleLowerCase()
                      .includes(searchFilter?.toLocaleLowerCase())
                  )}
                />
              ) : (
                <></>
              )}
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
  const theme = useCustomTheme();
  return (
    <div
      style={{ justifyContent: "center", display: "flex", paddingBottom: 25 }}
    >
      {members.map((member) => (
        <img src={member.image} style={{ height: 25 }} />
      ))}
      <div
        style={{ color: theme.custom.colors.smallTextColor, paddingLeft: 10 }}
      >
        {count} members
      </div>
    </div>
  );
}
