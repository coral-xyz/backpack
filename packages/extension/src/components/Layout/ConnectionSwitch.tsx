import { useState, Suspense } from "react";
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

function ConnectionMenu({ openPopper, setOpenPopper }: any) {
  const classes = useStyles();
  const [connectionUrl, setConnectionUrl] = useSolanaConnectionUrl();
  console.log("CONNECTION URL HERE", connectionUrl);
  const MAINNET_BETA = "https://solana-api.projectserum.com";
  const DEVNET = "https://api.devnet.solana.com";
  const LOCALNET = "http://localhost:8899";

  const clickMainnet = () => {
    setConnectionUrl(MAINNET_BETA);
    setOpenPopper(null);
  };
  const clickDevnet = () => {
    setConnectionUrl(DEVNET);
    setOpenPopper(null);
  };
  const clickLocalnet = () => {
    setConnectionUrl(LOCALNET);
    setOpenPopper(null);
  };
  const clickCustomEndpoint = () => {
    setOpenPopper(null);
  };

  return (
    <Popper
      open={openPopper !== null}
      anchorEl={openPopper}
      transition
      disablePortal
    >
      <ClickAwayListener onClickAway={() => setOpenPopper(null)}>
        <MenuList className={classes.connectionMenu}>
          <MenuItem onClick={() => clickMainnet()}>
            <ListItemIcon
              style={{
                visibility:
                  connectionUrl !== MAINNET_BETA ? "hidden" : undefined,
              }}
            >
              <CheckBox />
            </ListItemIcon>
            <ListItemText>Mainnet Beta</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => clickDevnet()}>
            <ListItemIcon
              style={{
                visibility: connectionUrl !== DEVNET ? "hidden" : undefined,
              }}
            >
              <CheckBox />
            </ListItemIcon>
            <ListItemText>Devnet</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => clickLocalnet()}>
            <ListItemIcon
              style={{
                visibility: connectionUrl !== LOCALNET ? "hidden" : undefined,
              }}
            >
              <CheckBox />
            </ListItemIcon>
            <ListItemText>Localnet</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => clickCustomEndpoint()}>
            <ListItemIcon
              style={{
                visibility: "hidden",
              }}
            >
              <CheckBox />
            </ListItemIcon>
            <ListItemText>Add Custom Endpoint</ListItemText>
          </MenuItem>
        </MenuList>
      </ClickAwayListener>
    </Popper>
  );
}
