import { LocalImage } from "@coral-xyz/react-common";
import { useUser } from "@coral-xyz/recoil";
import { useUsersMetadata } from "@coral-xyz/chat-xplat";
import CloseIcon from "@mui/icons-material/Close";
import { createStyles, makeStyles } from "@mui/styles";

import { useChatContext } from "../ChatContext";

const useStyles = makeStyles((theme: any) =>
  createStyles({
    topDiv: {
      display: "flex",
    },
    midDiv: {
      flex: 1,
      color: theme.custom.colors.background,
      display: "flex",
      justifyContent: "center",
      marginTop: 16,
    },
    avatar: {
      height: 32,
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      width: "100%",
    },
    title: {
      flex: 1,
      fontSize: 18,
      padding: 10,
      textAlign: "center",
    },
    icon: {
      color: theme.custom.colors.icon,
    },
    iconOuter: {
      cursor: "pointer",
      paddingLeft: 5,
    },
  })
);

export const BarterHeader = () => {
  const classes = useStyles();
  const { setOpenPlugin, remoteUserId } = useChatContext();
  const { uuid } = useUser();

  const remoteUsers = useUsersMetadata({ remoteUserIds: [remoteUserId, uuid] });
  const remoteUserImage = remoteUsers?.[remoteUserId]?.image;
  const localUserImage = remoteUsers?.[uuid]?.image;

  return (
    <div className={classes.topDiv}>
      <div className={classes.midDiv}>
        <div className={classes.iconOuter} onClick={() => setOpenPlugin("")}>
          <CloseIcon className={classes.icon} />
        </div>
        <div style={{ flex: 1 }}>
          <div className={classes.avatar}>
            <LocalImage
              size={32}
              style={{ width: 32, height: 32, borderRadius: "50%" }}
              src={localUserImage}
            />
          </div>
          <div className={classes.title}>Your offer</div>
        </div>
      </div>
      <div className={classes.midDiv}>
        <div style={{ flex: 1 }}>
          <div className={classes.avatar}>
            <LocalImage
              size={32}
              style={{ width: 32, height: 32, borderRadius: "50%" }}
              src={remoteUserImage}
            />
          </div>
          <div className={classes.title}>Their offer</div>
        </div>
      </div>
    </div>
  );
};
