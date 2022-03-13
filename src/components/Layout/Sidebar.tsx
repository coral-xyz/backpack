import { useState, Suspense } from "react";
import Sidebar from "react-sidebar";
import * as bs58 from "bs58";
import {
  useTheme,
  makeStyles,
  Typography,
  IconButton,
  List,
  ListItem,
  Drawer,
  Button,
  Divider,
  TextField,
} from "@material-ui/core";
import { Add, Menu, Close, Lock, Help, FlashOn } from "@material-ui/icons";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  EXTENSION_HEIGHT,
} from "../../common";
import { getBackgroundClient } from "../../background/client";
import { NAV_BAR_HEIGHT } from "./Nav";
import { useKeyringStoreState } from "../../context/KeyringStoreState";
import { KeyringStoreStateEnum } from "../../keyring/store";
import { useWalletPublicKeys } from "../../context/Wallet";
import { WalletAddress } from "../../components/common";

const useStyles = makeStyles((theme: any) => ({
  menuButtonContainer: {
    width: "38px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
  },
  menuButton: {
    padding: 0,
    "&:hover": {
      background: "transparent",
    },
  },
  menuButtonIcon: {
    color: theme.custom.colors.hamburger,
  },
  sidebarContentListItem: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: "5px",
    paddingBottom: "5px",
  },
  withDrawer: {
    height: EXTENSION_HEIGHT - NAV_BAR_HEIGHT,
    backgroundColor: theme.custom.colors.background,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  withDrawerContent: {
    flex: 1,
  },
  drawerRoot: {
    top: `${NAV_BAR_HEIGHT}px !important`,
    zIndex: "1 !important" as any,
  },
  closeDrawerButton: {
    backgroundColor: theme.custom.colors,
    width: "100%",
  },
  sidebarDivider: {
    marginTop: "8px",
    marginBottom: "8px",
    backgroundColor: theme.custom.colors.offText,
  },
  addConnectWalletLabel: {
    color: theme.custom.colors.fontColor,
  },
  sidebarContent: {
    display: "flex",
  },
  overviewLabel: {
    color: theme.custom.colors.fontColor,
  },
}));

export function SidebarButton() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className={classes.menuButtonContainer}>
      <Sidebar
        contentClassName={classes.sidebarContent}
        sidebar={<SidebarContent close={() => setSidebarOpen(false)} />}
        open={sidebarOpen}
        onSetOpen={setSidebarOpen}
        styles={{
          sidebar: {
            width: "269px",
            position: "fixed",
            backgroundColor: theme.custom.colors.background,
          },
        }}
      >
        <IconButton
          disableRipple
          className={classes.menuButton}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className={classes.menuButtonIcon} />
        </IconButton>
      </Sidebar>
    </div>
  );
}

function SidebarContent({ close }: { close: () => void }) {
  return (
    <Suspense fallback={<div></div>}>
      <_SidebarContent close={close} />
    </Suspense>
  );
}

function _SidebarContent({ close }: { close: () => void }) {
  const classes = useStyles();
  const theme = useTheme() as any;
  const namedPublicKeys = useWalletPublicKeys();
  const keyringStoreState = useKeyringStoreState();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerView, setDrawerView] = useState("recent-activity");
  const _setOpenRecentActivity = (openDrawer: boolean) => {
    setDrawerView("recent-activity");
    setOpenDrawer(openDrawer);
  };
  const _setOpenAddConnect = (openDrawer: boolean) => {
    setDrawerView("add-connect");
    setOpenDrawer(openDrawer);
  };
  const lockWallet = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error)
      .then(() => close());
  };
  const clickWallet = (publicKey: PublicKey) => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
        params: [publicKey.toString()],
      })
      .then((_resp) => close())
      .catch(console.error);
  };
  console.log("named", namedPublicKeys);
  return (
    <div>
      <SidebarHeader close={close} />
      <List
        style={{
          color: theme.custom.colors.fontColor,
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        {namedPublicKeys.hdPublicKeys.map(({ name, publicKey }) => {
          return (
            <ListItem
              key={publicKey.toString()}
              button
              className={classes.sidebarContentListItem}
              onClick={() => clickWallet(publicKey)}
            >
              <WalletAddress name={name} publicKey={publicKey} />
            </ListItem>
          );
        })}
        {namedPublicKeys.importedPublicKeys.map(({ name, publicKey }) => {
          return (
            <ListItem
              key={publicKey.toString()}
              button
              className={classes.sidebarContentListItem}
              onClick={() => clickWallet(publicKey)}
            >
              <WalletAddress name={name} publicKey={publicKey} />
            </ListItem>
          );
        })}
        {keyringStoreState === KeyringStoreStateEnum.Unlocked && (
          <>
            <ListItem
              button
              className={classes.sidebarContentListItem}
              onClick={() => {
                close();
                _setOpenAddConnect(true);
              }}
            >
              <Add
                style={{
                  color: theme.custom.colors.offText,
                  marginRight: "12px",
                }}
              />
              <Typography>Add / Connect Wallet</Typography>
            </ListItem>
            <Divider className={classes.sidebarDivider} />
            <ListItem
              button
              className={classes.sidebarContentListItem}
              onClick={() => {
                close();
                _setOpenRecentActivity(true);
              }}
            >
              <FlashOn
                style={{
                  color: theme.custom.colors.offText,
                  marginRight: "12px",
                }}
              />
              <Typography>Recent Activity</Typography>
            </ListItem>
          </>
        )}
        <ListItem button className={classes.sidebarContentListItem}>
          <Help
            style={{ color: theme.custom.colors.offText, marginRight: "12px" }}
          />
          <Typography>Help & Support</Typography>
        </ListItem>
        {keyringStoreState === KeyringStoreStateEnum.Unlocked && (
          <ListItem
            button
            className={classes.sidebarContentListItem}
            onClick={() => lockWallet()}
          >
            <Lock
              style={{
                color: theme.custom.colors.offText,
                marginRight: "12px",
              }}
            />
            <Typography>Lock Wallet</Typography>
          </ListItem>
        )}
      </List>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        {drawerView === "recent-activity" && <RecentActivity />}
        {drawerView === "add-connect" && (
          <AddConnectWallet closeDrawer={() => setOpenDrawer(false)} />
        )}
      </WithDrawer>
    </div>
  );
}

function SidebarHeader({ close }: { close: () => void }) {
  const theme = useTheme() as any;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        height: "46px",
        borderBottom: `solid 1pt ${theme.custom.colors.offText}`,
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: "bold",
          }}
        >
          200ms
        </Typography>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <IconButton onClick={close} style={{ padding: 0 }}>
          <Close style={{ color: theme.custom.colors.offText }} />
        </IconButton>
      </div>
    </div>
  );
}

export function WithDrawer(props: any) {
  const { children, openDrawer, setOpenDrawer } = props;
  const classes = useStyles();
  return (
    <Drawer
      BackdropProps={{
        style: {
          position: "absolute",
          top: NAV_BAR_HEIGHT,
          height: EXTENSION_HEIGHT - NAV_BAR_HEIGHT,
        },
      }}
      anchor={"bottom"}
      open={openDrawer}
      onClose={() => setOpenDrawer(false)}
      classes={{
        root: classes.drawerRoot,
      }}
    >
      <div className={classes.withDrawer}>
        <div className={classes.withDrawerContent}>{children}</div>
        {!props.skipFooter && (
          <Button
            onClick={() => setOpenDrawer(false)}
            variant="contained"
            className={classes.closeDrawerButton}
          >
            Close
          </Button>
        )}
      </div>
    </Drawer>
  );
}

function RecentActivity() {
  const classes = useStyles();
  return <div>TODO: RECENT ACTIVITY</div>;
}

function AddConnectWallet({ closeDrawer }: { closeDrawer: () => void }) {
  const [importPrivateKey, setImportPrivateKey] = useState(false);
  const [connectHardware, setConnectHardware] = useState(false);
  return (
    <div>
      {importPrivateKey && <ImportPrivateKey closeDrawer={closeDrawer} />}
      {connectHardware && <ConnectHardware closeDrawer={closeDrawer} />}
      {!importPrivateKey && !connectHardware && (
        <AddConnectWalletMenu
          setImportPrivateKey={setImportPrivateKey}
          setConnectHardware={setConnectHardware}
          closeDrawer={closeDrawer}
        />
      )}
    </div>
  );
}

function AddConnectWalletMenu({
  closeDrawer,
  setImportPrivateKey,
  setConnectHardware,
}: {
  closeDrawer: () => void;
  setImportPrivateKey: (s: boolean) => void;
  setConnectHardware: (s: boolean) => void;
}) {
  const classes = useStyles();
  const createNewWallet = () => {
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
        params: [],
      })
      .then((newPubkeyStr: string) =>
        background
          .request({
            method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
            params: [newPubkeyStr],
          })
          .then((_resp) => closeDrawer())
          .catch(console.error)
      )
      .catch(console.error);
  };
  return (
    <List>
      <ListItem button onClick={() => createNewWallet()}>
        <Typography className={classes.addConnectWalletLabel}>
          Create a new wallet
        </Typography>
      </ListItem>
      <ListItem button onClick={() => setImportPrivateKey(true)}>
        <Typography className={classes.addConnectWalletLabel}>
          Import a private key
        </Typography>
      </ListItem>
      <ListItem button onClick={() => setConnectHardware(true)}>
        <Typography className={classes.addConnectWalletLabel}>
          Connect hardware wallet
        </Typography>
      </ListItem>
    </List>
  );
}

function ImportPrivateKey({ closeDrawer }: any) {
  const [name, setName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const onImport = () => {
    const kp = decodeAccount(secretKey);
    if (!kp) {
      setError("Invalid private key");
      return;
    }
    const secretKeyStr = Buffer.from(kp.secretKey).toString("hex");
    const background = getBackgroundClient();
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
        params: [secretKeyStr, name],
      })
      .then(() => closeDrawer())
      .catch(console.error);
  };
  return (
    <div>
      <Typography>Import private key</Typography>
      <TextField
        placeholder="Name (optional)"
        variant="outlined"
        margin="dense"
        required
        fullWidth
        InputLabelProps={{
          shrink: false,
        }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        placeholder="Secret Recover Phrase"
        variant="outlined"
        margin="dense"
        required
        fullWidth
        InputLabelProps={{
          shrink: false,
        }}
        value={secretKey}
        onChange={(e) => setSecretKey(e.target.value)}
      />
      {error && <Typography style={{ color: "red" }}>{error}</Typography>}
      <Button onClick={onImport}>Import</Button>
    </div>
  );
}

function ConnectHardware({ closeDrawer }: any) {
  return <div>Connect hardware TODO</div>;
}

function decodeAccount(privateKey: string) {
  try {
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
  } catch (_) {
    try {
      return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
    } catch (_) {
      return undefined;
    }
  }
}
