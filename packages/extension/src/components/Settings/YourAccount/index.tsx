import { useEffect } from "react";
import { ListItemText } from "@mui/material";
import { ArrowForwardIos } from "@mui/icons-material";
import useTheme from "@mui/styles/useTheme";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { List, ListItem } from "../../common";
import { ChangePassword } from "./ChangePassword";

export function YourAccount({ close }: { close: () => void }) {
  const nav = useEphemeralNav();
  const theme = useTheme() as any;

  const menuItems = {
    "Change password": {
      label: "Connection",
      onClick: () => nav.push(<ChangePassword close={close} />),
      detailIcon: (props: any) => <ArrowForwardIos {...props} />,
    },
    "Edit wallets": {},
    "Export private key": {},
    "Show secret recovery phrase": {},
    "Reset wallet": {},
  };

  useEffect(() => {
    const navButton = nav.navButtonRight;
    nav.setNavButtonRight(null);
    nav.setTitle("Your Account");
    nav.setStyle({
      borderBottom: `solid 1pt ${theme.custom.colors.border}`,
    });
    return () => {
      nav.setNavButtonRight(navButton);
    };
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
        >
          <ListItemText>{key}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
