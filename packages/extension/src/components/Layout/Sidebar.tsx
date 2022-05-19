import { useEffect, useState, Suspense } from "react";
import * as bs58 from "bs58";
import {
  useTheme,
  makeStyles,
  Typography,
  IconButton,
  List,
  ListItem,
  Button,
  Divider,
  TextField,
} from "@material-ui/core";
import { Add, Menu, Close, Lock, Help, FlashOn } from "@material-ui/icons";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  getBackgroundClient,
  useEphemeralNav,
  useKeyringStoreState,
  KeyringStoreStateEnum,
  useWalletPublicKeys,
  useActiveWallet,
} from "@200ms/recoil";
import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
} from "@200ms/common";
import { WalletAddress } from "../../components/common";
import { WithDrawer, WithDrawerNoHeader } from "./Drawer";
import { openConnectHardware } from "../../background/popup";
import { ConnectionSwitch } from "./ConnectionSwitch";

const useStyles = makeStyles((theme: any) => ({
  sidebarContainer: {
    height: "100%",
  },
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
  connectionListItem: {
    flexDirection: "column",
    alignItems: "start",
    marginTop: "10px",
  },
}));

const AVATAR_URL =
  "https://pbs.twimg.com/profile_images/1527030737731571713/7qMzHeBv_400x400.jpg";

export function SidebarButton() {
  const classes = useStyles();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className={classes.menuButtonContainer}>
      <IconButton
        disableRipple
        className={classes.menuButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <img
          src={AVATAR_URL}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "16px",
          }}
        />
      </IconButton>
      <WithDrawer
        openDrawer={sidebarOpen}
        setOpenDrawer={setSidebarOpen}
        title={""}
        navbarStyle={{ borderBottom: undefined }}
      >
        <SidebarContent close={() => setSidebarOpen(false)} />
      </WithDrawer>
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
  const activeWallet = useActiveWallet();
  const namedPublicKeys = useWalletPublicKeys();
  const keyringStoreState = useKeyringStoreState();
  const nav = useEphemeralNav();

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
  const listStyle = {
    color: theme.custom.colors.fontColor,
    background: theme.custom.colors.nav,
    paddingLeft: "16px",
    paddingRight: "16px",
    marginLeft: "16px",
    marginRight: "16px",
    borderRadius: "8px",
  };

  const keys = namedPublicKeys.hdPublicKeys
    .concat(namedPublicKeys.importedPublicKeys)
    .concat(namedPublicKeys.ledgerPublicKeys);

  return (
    <div className={classes.sidebarContainer}>
      <div>
        <img
          src={AVATAR_URL}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "32px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
          }}
        />
        <Typography
          style={{
            textAlign: "center",
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "28px",
            marginBottom: "40px",
          }}
        >
          {activeWallet.name}
        </Typography>
      </div>
      <List style={listStyle}>
        {keys.map(({ name, publicKey }) => {
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
          <ListItem
            button
            className={classes.sidebarContentListItem}
            onClick={() => {
              nav.push(<AddConnectWallet closeDrawer={() => {}} />);
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
        )}
      </List>
      <List
        style={{
          ...listStyle,
          marginTop: "40px",
        }}
      >
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
        <ListItem className={classes.connectionListItem}>
          <ConnectionSwitch />
        </ListItem>
      </List>
    </div>
  );
}

function AddConnectWallet({ closeDrawer }: { closeDrawer: () => void }) {
  const [importPrivateKey, setImportPrivateKey] = useState(false);
  const nav = useEphemeralNav();

  useEffect(() => {
    const navButton = nav.navButtonRight;
    nav.setNavButtonRight(undefined);
    return () => {
      nav.setNavButtonRight(navButton);
    };
  }, []);

  return (
    <div>
      {importPrivateKey && <ImportPrivateKey closeDrawer={closeDrawer} />}
      {!importPrivateKey && (
        <AddConnectWalletMenu
          setImportPrivateKey={setImportPrivateKey}
          closeDrawer={closeDrawer}
        />
      )}
    </div>
  );
}

function AddConnectWalletMenu({
  closeDrawer,
  setImportPrivateKey,
}: {
  closeDrawer: () => void;
  setImportPrivateKey: (s: boolean) => void;
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
      <ListItem button onClick={() => openConnectHardware()}>
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
        inputProps={{
          name: "mnemonic",
        }}
        placeholder="Secret Recovery Phrase"
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
