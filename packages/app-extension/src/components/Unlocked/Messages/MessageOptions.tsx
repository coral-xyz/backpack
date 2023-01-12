import { useState } from "react";
import type { Friendship } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  sendFriendRequest,
  unFriend,
} from "@coral-xyz/common";
import { toast } from "@coral-xyz/react-common";
import { friendship, useDecodedSearchParams } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Fade, Menu, MenuItem } from "@mui/material";
import Divider from "@mui/material/Divider";
import { useRecoilState } from "recoil";

import { useStyles } from "./styles";

export const MessageOptions = () => {
  const { props }: any = useDecodedSearchParams();
  const userId = props.userId;
  const remoteUsername = props.username;
  const [friendshipValue, setFriendshipValue] =
    useRecoilState<Friendship | null>(friendship({ userId }));
  const theme = useCustomTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const classes = useStyles();
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const send = async (sendRequest: boolean) => {
    await sendFriendRequest({ to: userId, sendRequest });
    setFriendshipValue((x: any) => ({
      ...x,
      requested: sendRequest,
    }));
    handleClose();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <MoreHorizIcon
        onClick={handleClick}
        style={{ cursor: "pointer", color: theme.custom.colors.icon }}
      />
      <Menu
        id="fade-menu"
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        className={classes.menu}
      >
        <div style={{ background: theme.custom.colors.background }}>
          <MenuItem
            className={classes.menuItem}
            disabled={friendshipValue?.blocked}
            onClick={async () => {
              if (friendshipValue?.areFriends) {
                await unFriend({ to: userId });
                setFriendshipValue((x: any) => ({
                  ...x,
                  areFriends: false,
                }));
                toast.success(
                  "Contact removed",
                  `We've removed @${remoteUsername} from your contacts.`
                );
              } else {
                if (friendshipValue?.requested) {
                  send(false);
                } else {
                  send(true);
                  toast.success(
                    friendshipValue?.remoteRequested ? "" : "",
                    friendshipValue?.remoteRequested
                      ? `You and ${remoteUsername} are now connected`
                      : `We'll let ${remoteUsername} know you want to connect.`
                  );
                }
              }
              handleClose();
            }}
          >
            {friendshipValue?.areFriends
              ? "Remove from contacts"
              : friendshipValue?.requested
              ? "Cancel Pending Request"
              : friendshipValue?.remoteRequested
              ? "Accept Contact Request"
              : "Add to contacts"}
          </MenuItem>
          <Divider style={{ marginTop: 0, marginBottom: 0 }} />
          <MenuItem
            className={classes.menuItem}
            disabled={friendshipValue?.spam}
            onClick={async () => {
              const updatedValue = !friendshipValue?.blocked;
              setFriendshipValue((x: any) => ({
                ...x,
                blocked: updatedValue,
                requested: updatedValue ? false : x.requested,
              }));
              await fetch(`${BACKEND_API_URL}/friends/block`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ to: userId, block: updatedValue }),
              });
              if (updatedValue) {
                toast.success(
                  "Blocked",
                  `@${remoteUsername} shouldn't be showing up in your DMs from now on.`
                );
              }
              handleClose();
            }}
          >
            {friendshipValue?.blocked ? "Unblock" : "Block"}
          </MenuItem>
          <MenuItem
            className={classes.menuItem}
            onClick={async () => {
              const updatedValue = !friendshipValue?.spam;
              await fetch(`${BACKEND_API_URL}/friends/spam`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ to: userId, spam: updatedValue }),
              });
              setFriendshipValue((x: any) => ({
                ...x,
                spam: updatedValue,
              }));
              handleClose();
            }}
          >
            {friendshipValue?.spam ? `Remove spam` : `Mark as spam`}
          </MenuItem>
        </div>
      </Menu>
    </div>
  );
};
