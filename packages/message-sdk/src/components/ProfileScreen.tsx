import { useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  NAV_COMPONENT_MESSAGE_CHAT,
  sendFriendRequest,
} from "@coral-xyz/common";
import {
  Loading,
  LocalImage,
  MessageBubbleIcon,
  PrimaryButton,
  useUsersMetadata,
} from "@coral-xyz/react-common";
import { useNavigation } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import LockIcon from "@mui/icons-material/Lock";
import VerifiedIcon from "@mui/icons-material/Verified";
import { IconButton } from "@mui/material";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

import { useStyles } from "./styles";

export const ProfileScreen = ({ userId }: { userId: string }) => {
  const [friendship, setFriendship] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [user, setUser] = useState<{
    username?: string;
    image?: string;
    id?: string;
  }>({});
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
    setLoading(false);
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
      <div style={{ flex: 1 }}>
        <div className={classes.horizontalCenter}>
          <div className={classes.topImageOuter}>
            <LocalImage
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
                style={{ padding: 2 }}
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
            subtitle={`You can still message and send things to @${user.username}.`}
          />
        ) : null}
        {!friendship && !requestSent ? (
          <ContactSection
            icon={<LockIcon style={{ color: theme.custom.colors.icon }} />}
            title="This is not a friend"
            subtitle="You can message and send crypto to anyone on Backpack, but we suggest only adding friends you know and trust."
          />
        ) : null}
      </div>
      <div>
        {!friendship && !requestSent ? (
          <PrimaryButton
            label="Request to add friend"
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
