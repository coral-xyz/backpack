import { useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  NAV_COMPONENT_MESSAGE_CHAT,
  sendFriendRequest,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  Loading,
  LocalImage,
  MessageBubbleIcon,
  PrimaryButton,
} from "@coral-xyz/react-common";
import { useNavigation } from "@coral-xyz/recoil";
import { useUsersMetadata } from "@coral-xyz/tamagui";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ContentCopy from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Button, IconButton, Tooltip } from "@mui/material";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { useStyles } from "./styles";

async function getActiveWalletsForUser(
  username: string
): Promise<{ blockchain: string; publicKey: string }[]> {
  const res = await fetch(`${BACKEND_API_URL}/users/${username}`);
  const json = await res.json();
  return json.publicKeys;
}

export const ProfileScreen = ({ userId }: { userId: string }) => {
  const [friendship, setFriendship] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [user, setUser] = useState<{
    username?: string;
    image?: string;
    id?: string;
  }>({});
  const [userWallets, setUserWallets] = useState<
    { blockchain: string; publicKey: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const theme = useCustomTheme();
  const userMetadata = useUsersMetadata({ remoteUserIds: [userId] });
  const { push } = useNavigation();

  async function getChatRoom() {
    const res = await ParentCommunicationManager.getInstance().fetch(
      `${BACKEND_API_URL}/friends?userId=${userId}`
    );
    const json = await res.json();
    if (json.user) {
      setFriendship(json.are_friends);
      setUser(json.user);
      setRequestSent(json.request_sent);
    }
  }

  const send = async (sendRequest: boolean) => {
    await sendFriendRequest({
      to: userId,
      sendRequest,
    });
    setRequestSent(sendRequest);
  };

  useEffect(() => {
    getChatRoom();
  }, []);

  useEffect(() => {
    if (!user.username) {
      return;
    }

    getActiveWalletsForUser(user.username)
      .then(setUserWallets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.username]);

  if (loading) {
    return (
      <div style={{ height: "100vh" }}>
        <Loading />
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        padding: 16,
      }}
    >
      {userWallets.length > 0 ? (
        <div
          style={{
            flex: 0.5,
            marginTop: -16,
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {userWallets.map((w) => (
            <PrimaryNetworkWallet
              key={w.blockchain}
              blockchain={w.blockchain}
              publicKey={w.publicKey}
              title="Copy address"
            />
          ))}
        </div>
      ) : null}
      <div>
        <div className={classes.horizontalCenter}>
          <div className={classes.topImageOuter}>
            <LocalImage
              size={150}
              className={classes.topImage}
              src={userMetadata[userId]?.image}
              style={{ width: 150, height: 150 }}
            />
          </div>
        </div>
        <br />
        <div className={classes.horizontalCenter}>
          <div style={{ marginRight: 25 }}>
            <IconButton
              size="large"
              className={classes.icon}
              onClick={async () => {
                push({
                  title: `@${user.username}`,
                  componentId: NAV_COMPONENT_MESSAGE_CHAT,
                  componentProps: {
                    userId: user.id,
                    username: user.username,
                  },
                });
              }}
            >
              <MessageBubbleIcon
                style={{ padding: 2, height: 21 }}
                fill={theme.custom.colors.fontColor}
              />
            </IconButton>
            <div
              className={classes.smallText}
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              Message
            </div>
          </div>
          <div>
            <IconButton
              style={{ cursor: "not-allowed" }}
              size="large"
              className={classes.icon}
            >
              <ArrowUpwardIcon
                style={{ height: 21, color: theme.custom.colors.fontColor }}
              />
            </IconButton>
            <div
              className={classes.smallText}
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              Send
            </div>
          </div>
        </div>
        <br />
        {friendship ? (
          <ContactSection
            icon={<VerifiedIcon style={{ color: theme.custom.colors.icon }} />}
            title="Connected"
            subtitle={`You and @${user.username} are mutual friends`}
          />
        ) : null}
        {!friendship && requestSent ? (
          <ContactSection
            icon={<LockIcon style={{ color: theme.custom.colors.icon }} />}
            title="Friend pending request"
            subtitle="You can still send messages and interact"
          />
        ) : null}
        {!friendship && !requestSent ? (
          <ContactSection
            icon={<LockIcon style={{ color: theme.custom.colors.icon }} />}
            title="This is not a friend"
            subtitle="Only add friends you know and trust"
          />
        ) : null}
      </div>
      <div>
        {!friendship && !requestSent ? (
          <PrimaryButton
            label="Accept friend request"
            onClick={() => send(true)}
          />
        ) : null}
        {!friendship && requestSent ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <PrimaryButton
              label="Cancel Pending Request"
              style={{ margin: 3 }}
              onClick={() => send(false)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

function PrimaryNetworkWallet({
  blockchain,
  publicKey,
  title,
}: {
  blockchain: string;
  publicKey: string;
  title: string;
}) {
  const theme = useCustomTheme();
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  const icon =
    blockchain === "solana" ? (
      <img style={{ height: 10 }} src="/solana.png" />
    ) : blockchain === "ethereum" ? (
      <img style={{ height: 12 }} src="/ethereum.png" />
    ) : null;

  return (
    <Tooltip title={open ? "Copied!" : title} open={open}>
      <Button
        disableElevation
        disableRipple
        style={{
          background: theme.custom.colors.nav,
          borderRadius: 15,
          color: theme.custom.colors.fontColor3,
          fontWeight: 600,
          fontSize: 12,
          padding: "4px 10px",
          height: "fit-content",
          textTransform: "none",
        }}
        onClick={async () => {
          await navigator.clipboard.writeText(publicKey);
          setOpen(true);
          setTimeout(() => setOpen(undefined), 2000);
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
        >
          {icon}
          {walletAddressDisplay(publicKey)}
          <ContentCopy sx={{ color: theme.custom.colors.icon, fontSize: 14 }} />
        </div>
      </Button>
    </Tooltip>
  );
}

function ContactSection({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <IconButton disabled className={classes.contactIconOuter} size="large">
          {" "}
          {icon}{" "}
        </IconButton>
      </div>
      <div className={classes.horizontalCenter} style={{ marginBottom: 16 }}>
        <div className={classes.smallTitle}>{title}</div>
      </div>
      <div className={classes.horizontalCenter}>
        <div
          className={classes.smallSubTitle}
          style={{ padding: 10, textAlign: "center" }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
