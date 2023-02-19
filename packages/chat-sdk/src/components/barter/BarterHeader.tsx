import { LocalImage,useUsersMetadata } from "@coral-xyz/react-common";
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
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: "50%",
    },
    title: {
      flex: 1,
      fontSize: 22,
      padding: 10,
      textAlign: "center",
    },
    icon: {
      color: theme.custom.colors.icon,
    },
    iconOuter: {
      cursor: "pointer",
    },
  })
);

export const BarterHeader = () => {
  const classes = useStyles();
  const { setOpenPlugin, remoteUserId } = useChatContext();

  const remoteUsers = useUsersMetadata({ remoteUserIds: [remoteUserId] });
  const remoteUserImage = remoteUsers?.[0]?.image;

  return (
    <div className={classes.topDiv}>
      <div className={classes.midDiv}>
        <div className={classes.iconOuter} onClick={() => setOpenPlugin("")}>
          <CloseIcon className={classes.icon} />
        </div>
        <div style={{ flex: 1 }}>
          <div className={classes.avatar}>
            <LocalImage
              style={{ width: 32, height: 32, borderRadius: "50%" }}
              src={remoteUserImage}
            />
          </div>
          <div className={classes.title}>Your offer</div>
        </div>
      </div>
      <div className={classes.midDiv}>
        <div className={classes.avatar}>
          <LocalImage
            style={{ width: 32, height: 32, borderRadius: "50%" }}
            src={remoteUserImage}
          />
        </div>
        <div className={classes.title}>Their offer</div>
      </div>
    </div>
  );
};
