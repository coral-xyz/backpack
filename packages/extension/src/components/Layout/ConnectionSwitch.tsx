import { useState } from "react";
import {
  makeStyles,
  Button,
  Popper,
  MenuList,
  MenuItem,
  ClickAwayListener,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { CheckBox } from "@material-ui/icons";
import { useSolanaConnectionUrl } from "@200ms/recoil";

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

export function ConnectionSwitch() {
  const classes = useStyles();
  const [openPopper, setOpenPopper] = useState<any>(null);
  return (
    <>
      <Button
        className={classes.connectionButton}
        disableRipple
        onClick={(e) => setOpenPopper(e.currentTarget)}
      >
        Cluster Menu
      </Button>
      <ConnectionMenu openPopper={openPopper} setOpenPopper={setOpenPopper} />
    </>
  );
}

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

function ConnectionMenu({ openPopper, setOpenPopper }: any) {
  const classes = useStyles();
  const [connectionUrl, setConnectionUrl] = useSolanaConnectionUrl();

  const urls = Object.values(endpoints).filter((v) => typeof v === "string");

  const close = () => setOpenPopper(null);

  return openPopper ? (
    <Popper
      open
      anchorEl={openPopper}
      title={connectionUrl || undefined}
      transition
      disablePortal
    >
      <ClickAwayListener onClickAway={close}>
        <MenuList className={classes.connectionMenu}>
          {Object.entries(endpoints).map(([key, val]) => (
            <MenuItem
              key={key}
              onClick={() => {
                try {
                  const url = typeof val === "string" ? val : val();
                  setConnectionUrl(url);
                } catch (err) {
                  console.error(err);
                }
                close();
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
            </MenuItem>
          ))}
        </MenuList>
      </ClickAwayListener>
    </Popper>
  ) : connectionUrl ? (
    <a href={connectionUrl} className={classes.url} target="_blank">
      {new URL(connectionUrl).host}
    </a>
  ) : null;
}
