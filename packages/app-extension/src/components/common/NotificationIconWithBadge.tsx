import { useUnreadCount } from "@coral-xyz/recoil";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge } from "@mui/material";
import { makeStyles } from "@mui/styles";
const badgeStyle = {
  "& .MuiBadge-badge": {
    color: "white",
    backgroundColor: "#E33E3F",
    height: 16,
    minWidth: 16,
  },
};
const useStyles = makeStyles(() => ({
  badge: {
    fontSize: 10,
  },
}));

export const NotificationIconWithBadge = ({ style }: { style: any }) => {
  const [unreadCount] = useUnreadCount();
  const classes = useStyles();

  if (!unreadCount) {
    return <NotificationsIcon style={style} />;
  }

  return (
    <Badge
      sx={badgeStyle}
      badgeContent={unreadCount}
      classes={{ badge: classes.badge }}
    >
      <NotificationsIcon style={style} />
    </Badge>
  );
};
