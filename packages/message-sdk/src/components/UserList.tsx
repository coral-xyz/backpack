import { NAV_COMPONENT_MESSAGE_PROFILE } from "@coral-xyz/common";
import { isFirstLastListItemStyle, ProxyImage } from "@coral-xyz/react-common";
// import { useNavigation } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { List, ListItem } from "@mui/material";

import { useStyles } from "./styles";

export const UserList = ({
  users,
}: {
  users: { image: string; id: string; username: string }[];
}) => {
  const theme = useCustomTheme();

  return (
    <List
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: "14px",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      {users.map((user, index) => (
        <UserListItem
          user={user}
          isFirst={index === 0}
          isLast={index === users.length - 1}
        />
      ))}
    </List>
  );
};

function UserListItem({
  user,
  isFirst,
  isLast,
}: {
  user: { image: string; id: string; username: string };
  isFirst: boolean;
  isLast: boolean;
}) {
  const theme = useCustomTheme();
  // const { push } = useNavigation();
  const push: any = () => {};
  const classes = useStyles();
  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        push({
          title: `@${user.username}`,
          componentId: NAV_COMPONENT_MESSAGE_PROFILE,
          componentProps: {
            userId: user.id,
          },
        });
      }}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
        display: "flex",
        height: "48px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          className={classes.hoverParent}
          style={{ flex: 1, display: "flex", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <UserIcon image={user.image} />
            </div>
            <div className={classes.userText}>{user.username}</div>
          </div>
          <div className={classes.hoverChild}>
            <ArrowForwardIcon
              fontSize={"small"}
              style={{ marginTop: 4, color: theme.custom.colors.fontColor }}
            />
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function UserIcon({ image }: any) {
  const classes = useStyles();
  return <ProxyImage src={image} className={classes.iconCircular} />;
}
