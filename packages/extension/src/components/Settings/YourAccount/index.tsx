import { useEffect } from "react";
import { ListItemText } from "@mui/material";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { List, ListItem } from "../../common";
import { ArrowForwardIos } from "@mui/icons-material";
import { ChangePassword } from "./ChangePassword";

export function YourAccount({ close }: { close: () => void }) {
  const nav = useEphemeralNav();

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
    return () => {
      nav.setNavButtonRight(navButton);
    };
  }, []);

  return (
    <List>
      {Object.entries(menuItems).map(([key, val]: any, i, { length }) => (
        <ListItem
          key={key}
          id={key}
          isLast={i === length - 1}
          onClick={val.onClick}
        >
          <ListItemText>{key}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
