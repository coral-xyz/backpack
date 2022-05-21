import { useEffect } from "react";
import { makeStyles, ListItemIcon, ListItemText } from "@material-ui/core";
import { CheckBox } from "@material-ui/icons";
import { useEphemeralNav, useSolanaConnectionUrl } from "@200ms/recoil";
import { List, ListItem } from "../common";

const useStyles = makeStyles((theme: any) => ({
  connectionButton: {
    padding: 0,
    color: theme.custom.colors.fontColor,
  },
  connectionMenu: {
    backgroundColor: theme.custom.colors.offText,
    color: theme.custom.colors.fontColor,
  },
  url: {
    color: theme.custom.colors.fontColor,
    opacity: 0.5,
    textDecoration: "none",
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
  const classes = useStyles();
  const [connectionUrl, setConnectionUrl] = useSolanaConnectionUrl();
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
          key={key}
          isLast={idx === endpointKvs.length - 1}
          onClick={() => {
            try {
              const url = typeof val === "string" ? val : val();
              setConnectionUrl(url);
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
