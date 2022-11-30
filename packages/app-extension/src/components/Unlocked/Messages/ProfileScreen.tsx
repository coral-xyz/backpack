import { useEffect, useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useNavStack } from "../../common/Layout/NavStack";
import { ProxyImage } from "../../common/ProxyImage";
import { IconButton } from "@mui/material";
import { MessageIcon } from "../../common/Icon";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useStyles } from "./styles";
import { useCustomTheme } from "@coral-xyz/themes";
import VerifiedIcon from "@mui/icons-material/Verified";
import LockIcon from "@mui/icons-material/Lock";
import { PrimaryButton, SecondaryButton } from "../../common";

export const ProfileScreen = ({ userId }: { userId: string }) => {
  const [friendship, setFriendship] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [user, setUser] = useState<{
    username?: string;
    image?: string;
    id?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const { title, setTitle } = useNavStack();
  const nav = useNavStack();
  const classes = useStyles();
  const theme = useCustomTheme();

  useEffect(() => {
    if (!user.username) {
      return () => {};
    }
    const prev = title;
    setTitle(`@${user.username}`);
    return () => {
      setTitle(prev);
    };
  }, [user.username]);

  async function getChatRoom() {
    const res = await fetch(`${BACKEND_API_URL}/friends?userId=${userId}`);
    const json = await res.json();
    if (json.user) {
      setFriendship(json.are_friends);
      setUser(json.user);
      setRequestSent(json.request_sent);
    }
    setLoading(false);
  }

  const sendFriendRequest = async (sendRequest: boolean) => {
    await fetch(`${BACKEND_API_URL}/friends/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: userId, sendRequest }),
    });
    setRequestSent(sendRequest);
  };

  useEffect(() => {
    getChatRoom();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
          <ProxyImage className={classes.topImage} src={user.image} />
        </div>
        <br />
        <div className={classes.horizontalCenter}>
          <div>
            <IconButton
              style={{ marginRight: 25 }}
              className={classes.icon}
              onClick={() => {
                nav.push("chat-screen", {
                  userId: user.id,
                  username: user.username,
                  image: user.image,
                });
              }}
            >
              <MessageIcon
                style={{ padding: 2 }}
                fill={theme.custom.colors.fontColor}
              />
            </IconButton>
            <div className={classes.text}>Message</div>
          </div>
          <div>
            <IconButton className={classes.icon}>
              <ArrowUpwardIcon
                style={{ color: theme.custom.colors.fontColor }}
              />
            </IconButton>
          </div>
          <div className={classes.text}>Send</div>
        </div>
        <br />
        {friendship && (
          <ContactSection
            icon={<VerifiedIcon style={{ color: theme.custom.colors.icon }} />}
            title={"Connected"}
            subtitle={`You and @${user.username} are mutual contacts`}
          />
        )}
        {!friendship && requestSent && (
          <ContactSection
            icon={<LockIcon style={{ color: theme.custom.colors.icon }} />}
            title={"Contact pending request"}
            subtitle={`You can still message and send crypto to @${user.username}.`}
          />
        )}
        {!friendship && !requestSent && (
          <ContactSection
            icon={<LockIcon style={{ color: theme.custom.colors.icon }} />}
            title={"This is not a contact"}
            subtitle={`You can message and send crypto to anyone on Backpack, but we suggest only adding contacts you know and trust.`}
          />
        )}
      </div>
      <div>
        {!friendship && !requestSent && (
          <PrimaryButton
            label={"Request to add contact"}
            onClick={() => sendFriendRequest(true)}
          />
        )}
        {!friendship && requestSent && (
          <div>
            <SecondaryButton
              label={"Cancel"}
              onClick={() => sendFriendRequest(false)}
            />
            <PrimaryButton
              disabled
              label={"Requested"}
              onClick={() => sendFriendRequest(true)}
            />
          </div>
        )}
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
        <IconButton className={classes.contactIconOuter} size={"large"}>
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
