import { useEffect } from "react";
import { ListItemText } from "@mui/material";
import useTheme from "@mui/styles/useTheme";
import { List, ListItem, PushDetail } from "../../common";
import { useDrawerContext } from "../../Layout/Drawer";
import { useNavStack } from "../../Layout/NavStack";

export function YourAccount() {
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const theme = useTheme() as any;

  const menuItems = {
    "Change password": {
      onClick: () => nav.push("change-password"),
    },
    "Edit wallets": {},
    "Show private key": {
      onClick: () => nav.push("show-private-key-warning"),
    },
    "Show secret recovery phrase": {
      onClick: () => nav.push("show-secret-phrase-warning"),
    },
    "Reset wallet": {
      onClick: () => nav.push("reset-warning", { onClose: () => close() }),
    },
  };

  useEffect(() => {
    nav.setTitle("Your Account");
    nav.setStyle({
      borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    });
  }, []);

  return (
    <List style={{ marginTop: "16px" }}>
      {Object.entries(menuItems).map(([key, val]: any, i, { length }) => (
        <ListItem
          key={key}
          id={key}
          isLast={i === length - 1}
          onClick={val.onClick}
          style={{
            height: "44px",
            padding: "10px",
          }}
          detail={<PushDetail />}
        >
          <ListItemText style={{ fontWeight: 500 }}>{key}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
