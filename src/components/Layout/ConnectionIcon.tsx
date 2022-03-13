import { useState, Suspense } from "react";
import {
  makeStyles,
  IconButton,
  Popper,
  MenuList,
  MenuItem,
  ClickAwayListener,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { CheckBox } from "@material-ui/icons";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useKeyringStoreState } from "../../context/KeyringStoreState";
import { useSolanaConnection } from "../../context/Connection";

const useStyles = makeStyles((theme: any) => ({
  menuButtonContainer: {
    width: "38px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
  },
  connectedIcon: {
    width: "12px",
    height: "12px",
    borderRadius: "6px",
    backgroundColor: theme.custom.colors.connected,
    position: "absolute",
    right: 0,
  },
  disconnectedIcon: {
    width: "12px",
    height: "12px",
    borderRadius: "6px",
    backgroundColor: theme.custom.colors.disconnected,
    position: "absolute",
    right: 0,
  },
  connectionButton: {
    padding: 0,
  },
  connectionMenu: {
    backgroundColor: theme.custom.colors.offText,
    color: theme.custom.colors.fontColor,
  },
}));

export function ConnectionIcon() {
  return (
    <Suspense fallback={<div></div>}>
      <_ConnectionIcon />
    </Suspense>
  );
}

function _ConnectionIcon() {
  const classes = useStyles();
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;
  const isConnected = false;
  const [openPopper, setOpenPopper] = useState<any>(null);
  return (
    <>
      <div
        className={classes.menuButtonContainer}
        style={{ visibility: "hidden" /*isLocked ? "hidden" : undefined*/ }}
      >
        <IconButton
          className={classes.connectionButton}
          disableRipple
          onClick={(e) => setOpenPopper(e.currentTarget)}
        >
          <div
            className={
              isConnected ? classes.connectedIcon : classes.disconnectedIcon
            }
          ></div>
        </IconButton>
      </div>
      {!isLocked && (
        <ConnectionMenu openPopper={openPopper} setOpenPopper={setOpenPopper} />
      )}
    </>
  );
}

function ConnectionMenu({ openPopper, setOpenPopper }: any) {
  const classes = useStyles();
  const { connectionUrl, setConnectionUrl } = useSolanaConnection();

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
