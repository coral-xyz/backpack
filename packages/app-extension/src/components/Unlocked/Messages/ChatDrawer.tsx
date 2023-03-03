import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { UserList } from "@coral-xyz/message-sdk";
import { LocalImage , SearchBox } from "@coral-xyz/react-common";
import {
  useDarkMode,
  useDecodedSearchParams,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Drawer, Typography } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

import { UserListSkeleton } from "./UserListSkeleton";
const LIMIT = 25;
let debouncedTimer = 0;

const useStyles = makeStyles((theme: any) =>
  createStyles({
    container: {
      padding: 0,
      color: theme.custom.colors.fontColor2,
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
  })
);

export const ChatDrawer = ({ setOpenDrawer }: { setOpenDrawer: any }) => {
  const isDark = useDarkMode();
  const classes = useStyles({ isDark });
  const { props, title }: any = useDecodedSearchParams();
  const [members, setMembers] = useState<RemoteUserData[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [staticMembers, setStaticMembers] = useState<RemoteUserData[]>([]);
  const { username } = useUser();
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
      }&type=collection&limit=${LIMIT}&offset=${offset}&prefix=${prefix}`
    );
    const json = await response.json();
    setMembers(json.members);
    setCount(json.count);
    setLoading(false);
    setStaticMembers((members) => {
      if (members.length === 0) {
        return json.members.slice(0, 3);
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
      sx={{
        "& .MuiDrawer-paper": {
          background: isDark
            ? theme.custom.colors.background
            : theme.custom.colors.nav,
          height: "90vh",
          borderTopLeftRadius: "15px",
          borderTopRightRadius: "15px",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
      anchor="bottom"
      open
      onClose={() => setOpenDrawer(false)}
    >
      <div className={classes.drawerContainer}>
        <div className={classes.horizontalCenter}>
          <Typography variant="h5" className={classes.title}>
            {props.title || title}
          </Typography>
        </div>
        {count !== 0 ? (
          <MembersList
            count={count}
            members={[
              ...staticMembers.map((x) => ({
                image: x.image,
              })),
              {
                image: `https://swr.xnfts.dev/avatars/${username}`,
              },
            ]}
          />
        ) : null}
        <SearchBox
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          placeholder="Search username"
          onChange={(prefix: string) => {
            setSearchFilter(prefix);
            debouncedInit(prefix, 0);
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 5,
            color: theme.custom.colors.smallTextColor,
          }}
        >
          <div
            style={{
              padding: 5,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              color: theme.custom.colors.blue,
            }}
            onClick={() => {
              debouncedInit(searchFilter, Math.max(offset - 1, 0));
            }}
          >
            {offset !== 0 ? "Prev" : ""}
          </div>
          {/* TODO: clean up this logic */}
          {members.length === LIMIT ? (
            <div
              style={{
                padding: 5,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.custom.colors.blue,
              }}
              onClick={() => {
                debouncedInit(searchFilter, offset + 1);
              }}
            >
              Next
            </div>
          ) : null}
        </div>

        {loading ? <UserListSkeleton /> : null}
        {!loading ? (
          <div className={classes.container}>
            {members.filter((x) =>
              x.username
                ?.toLocaleLowerCase()
                .includes(searchFilter?.toLocaleLowerCase())
            ).length !== 0 ? (
              <UserList
                style={{
                  border: "none",
                }}
                itemStyle={{
                  backgroundColor: isDark
                    ? theme.custom.colors.background
                    : undefined,
                  border: "none",
                }}
                setMembers={setMembers}
                users={members.filter((x) =>
                  x.username
                    ?.toLocaleLowerCase()
                    .includes(searchFilter?.toLocaleLowerCase())
                )}
              />
            ) : (
              <div />
            )}
          </div>
        ) : null}
      </div>
    </Drawer>
  );
};

function MembersList({
  count,
  members,
}: {
  count: number;
  members: { image: string }[];
}) {
  const theme = useCustomTheme();
  const countText = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
  return (
    <div
      style={{
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        paddingBottom: 20,
      }}
    >
      {members.map((member, idx) => (
        <LocalImage
          key={idx}
          src={member.image}
          loadingStyles={{
            height: 30,
            width: 30,
            borderRadius: "50%",
          }}
          style={{
            border: `solid 2px ${theme.custom.colors.nav}`,
            borderRadius: "50%",
            height: 30,
            ...(idx > 0 ? { marginLeft: "-12px" } : {}),
          }}
        />
      ))}
      <div
        style={{ color: theme.custom.colors.smallTextColor, paddingLeft: 10 }}
      >
        {countText} members
      </div>
    </div>
  );
}
