import { useEffect } from "react";
import { ListItemText } from "@mui/material";
import useTheme from "@mui/styles/useTheme";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { List, ListItem, PushDetail } from "../../common";
import { ChangePassword } from "./ChangePassword";
import { ShowPrivateKeyWarning } from "./ShowPrivateKey";
import { ShowRecoveryPhraseWarning } from "./ShowRecoveryPhrase";
import { ResetWarning } from "../../Locked/Reset/ResetWarning";

export function YourAccount({ close }: { close: () => void }) {
  const nav = useEphemeralNav();
  const theme = useTheme() as any;

  const menuItems = {
    "Change password": {
      onClick: () => nav.push(<ChangePassword close={close} />),
    },
    "Edit wallets": {},
    "Show private key": {
      onClick: () => nav.push(<ShowPrivateKeyWarning />),
    },
    "Show secret recovery phrase": {
      onClick: () => nav.push(<ShowRecoveryPhraseWarning />),
    },
    "Reset wallet": {
      onClick: () => nav.push(<ResetWarning onClose={close} />),
    },
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
          detail={<PushDetail />}
        >
          <ListItemText style={{ fontWeight: 500 }}>{key}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
