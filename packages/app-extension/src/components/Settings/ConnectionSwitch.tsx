import { useEffect } from "react";
import { ListItemIcon, ListItemText } from "@mui/material";
import { styles } from "@coral-xyz/themes";
import { CheckBox } from "@mui/icons-material";
import { UI_RPC_METHOD_CONNECTION_URL_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient, useSolanaConnectionUrl } from "@coral-xyz/recoil";
import { useDrawerContext } from "../Layout/Drawer";
import { useNavStack } from "../Layout/NavStack";
import { List, ListItem } from "../common";

const useStyles = styles((theme) => ({
  connectionMenu: {
    // backgroundColor: theme.custom.colors.offText,
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

export function ConnectionMenu() {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const classes = useStyles();
  const connectionUrl = useSolanaConnectionUrl();
  const nav = useNavStack();
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
