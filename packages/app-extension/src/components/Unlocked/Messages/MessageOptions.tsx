import { useState } from "react";
import {
  BACKEND_API_URL,
  sendFriendRequest,
  unFriend,
} from "@coral-xyz/common";
import { toast } from "@coral-xyz/react-common";
import {
  useDecodedSearchParams,
  useFriendship,
  useUpdateFriendships,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Fade } from "@mui/material";

import PopoverMenu from "../../common/PopoverMenu";

export const MessageOptions = () => {
  const { props }: any = useDecodedSearchParams();
  const userId = props.userId;
  const remoteUsername = props.username;
  const friendshipValue = useFriendship({ userId });
  const setFriendshipValue = useUpdateFriendships();
  const theme = useCustomTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const send = async (sendRequest: boolean) => {
    await sendFriendRequest({ to: userId, sendRequest });
    setFriendshipValue({
      userId: userId,
      friendshipValue: {
        requested: sendRequest,
      },
    });
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
      <PopoverMenu.Root
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <PopoverMenu.Group>
          <PopoverMenu.Item
            disabled={friendshipValue?.blocked}
            onClick={async () => {
              if (friendshipValue?.areFriends) {
                await unFriend({ to: userId });
                setFriendshipValue({
                  userId: userId,
                  friendshipValue: {
                    areFriends: false,
                  },
                });
                toast.success(
                  "Friend removed",
                  `We've removed @${remoteUsername} from your friends.`
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
              ? "Remove from Friends"
              : friendshipValue?.requested
              ? "Cancel Pending Request"
              : friendshipValue?.remoteRequested
              ? "Accept Friend Request"
              : "Add to Friends"}
          </PopoverMenu.Item>
        </PopoverMenu.Group>
        <PopoverMenu.Group>
          <PopoverMenu.Item
            disabled={friendshipValue?.spam}
            onClick={async () => {
              const updatedValue = !friendshipValue?.blocked;
              setFriendshipValue({
                userId: userId,
                friendshipValue: {
                  blocked: updatedValue,
                  requested: updatedValue ? false : friendshipValue.requested,
                },
              });
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
          </PopoverMenu.Item>
          <PopoverMenu.Item
            onClick={async () => {
              const updatedValue = !friendshipValue?.spam;
              await fetch(`${BACKEND_API_URL}/friends/spam`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ to: userId, spam: updatedValue }),
              });
              setFriendshipValue({
                userId: userId,
                friendshipValue: {
                  spam: updatedValue,
                },
              });
              handleClose();
            }}
          >
            {friendshipValue?.spam ? `Remove spam` : `Mark as spam`}
          </PopoverMenu.Item>
        </PopoverMenu.Group>
      </PopoverMenu.Root>
    </div>
  );
};
