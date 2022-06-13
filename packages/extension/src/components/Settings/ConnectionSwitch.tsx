import { useEffect } from "react";
import { ListItemIcon, ListItemText } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { CheckBox } from "@mui/icons-material";
import {
  getBackgroundClient,
  UI_RPC_METHOD_CONNECTION_URL_UPDATE,
} from "@200ms/common";
import { useEphemeralNav, useSolanaConnectionUrl } from "@200ms/recoil";
import { List, ListItem } from "../common";

const useStyles = makeStyles((theme: any) => ({
  connectionMenu: {
    backgroundColor: theme.custom.colors.offText,
    color: theme.custom.colors.fontColor,
  },
}));

const endpoints = {
  "Mainnet (Beta)":
    process.env.DEFAULT_SOLANA_CONNECTION_URL ||
    "https://solana-api.projectserum.com",
  Devnet: "https://api.devnet.solana.com",
  Localnet: "http://localhost:8899",
  Custom: () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    new URL(prompt("Enter your custom endpoint")!.trim()).toString(),
};

export function ConnectionMenu({ close }: { close: () => void }) {
  const classes = useStyles();
  const connectionUrl = useSolanaConnectionUrl();
  const nav = useEphemeralNav();
  const urls = Object.values(endpoints).filter((v) => typeof v === "string");

  useEffect(() => {
    const navButton = nav.navButtonRight;
    nav.setNavButtonRight(null);
    return () => {
      nav.setNavButtonRight(navButton);
    };
  }, []);

  const endpointKvs = Object.entries(endpoints);
  return (
    <List className={classes.connectionMenu}>
      {endpointKvs.map(([key, val], idx) => (
        <ListItem
          id={key}
          key={key}
          isLast={idx === endpointKvs.length - 1}
          onClick={() => {
            try {
              const url = typeof val === "string" ? val : val();
              const background = getBackgroundClient();
              background
                .request({
                  method: UI_RPC_METHOD_CONNECTION_URL_UPDATE,
                  params: [url],
                })
                .then(close)
                .catch(console.error);
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <ListItemIcon
            style={{
              visibility:
                typeof val === "string"
                  ? connectionUrl === val
                    ? undefined
                    : "hidden"
                  : connectionUrl && urls.includes(connectionUrl)
                  ? "hidden"
                  : undefined,
            }}
          >
            <CheckBox />
          </ListItemIcon>
          <ListItemText>{key}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
