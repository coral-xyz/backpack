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
  TextField,
} from "@material-ui/core";
import {
  Add,
  Lock,
  Help,
  Public,
  ArrowForwardIos,
  Launch,
} from "@material-ui/icons";
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
import { openConnectHardware } from "../../background/popup";
import { WithDrawer } from "../Layout/Drawer";
import { ConnectionMenu } from "./ConnectionSwitch";

const useStyles = makeStyles((theme: any) => ({
  settingsContainer: {
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
  settingsContentListItem: {
    padding: "8px",
    height: "56px",
    display: "flex",
  },
  settingsDivider: {
    marginTop: "8px",
    marginBottom: "8px",
    backgroundColor: theme.custom.colors.offText,
  },
  addConnectWalletLabel: {
    color: theme.custom.colors.fontColor,
  },
  settingsContent: {
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

export function SettingsButton() {
  const classes = useStyles();
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className={classes.menuButtonContainer}>
      <IconButton
        disableRipple
        className={classes.menuButton}
        onClick={() => setSettingsOpen(!settingsOpen)}
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
        openDrawer={settingsOpen}
        setOpenDrawer={setSettingsOpen}
        title={""}
        navbarStyle={{ borderBottom: undefined }}
      >
        <SettingsContent close={() => setSettingsOpen(false)} />
      </WithDrawer>
    </div>
  );
}

function SettingsContent({ close }: { close: () => void }) {
  return (
    <Suspense fallback={<div></div>}>
      <_SettingsContent close={close} />
    </Suspense>
  );
}

function _SettingsContent({ close }: { close: () => void }) {
  const classes = useStyles();
  const keyringStoreState = useKeyringStoreState();

  return (
    <div className={classes.settingsContainer}>
      <AvatarHeader />
      {keyringStoreState === KeyringStoreStateEnum.Unlocked && <WalletList />}
      <SettingsList />
    </div>
  );
}

function AvatarHeader() {
  const activeWallet = useActiveWallet();
  const theme = useTheme() as any;
  return (
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
  );
}

function WalletList() {
  const classes = useStyles();
  const theme = useTheme() as any;
  const namedPublicKeys = useWalletPublicKeys();
  const nav = useEphemeralNav();

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
    padding: 0,
    marginLeft: "16px",
    marginRight: "16px",
    borderRadius: "8px",
  };
  const keys = namedPublicKeys.hdPublicKeys
    .concat(namedPublicKeys.importedPublicKeys)
    .concat(namedPublicKeys.ledgerPublicKeys);
  return (
    <>
      <List style={listStyle}>
        {keys.map(({ name, publicKey }, idx: number) => {
          return (
            <ListItem
              key={publicKey.toString()}
              button
              className={classes.settingsContentListItem}
              onClick={() => clickWallet(publicKey)}
              style={{
                borderBottom:
                  idx === keys.length - 1
                    ? undefined
                    : `solid 1pt ${theme.custom.colors.border}`,
              }}
            >
              <WalletAddress
                name={name}
                publicKey={publicKey}
                style={{
                  fontWeight: 500,
                  lineHeight: "24px",
                  fontSize: "16px",
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <List
        style={{
          ...listStyle,
          background: theme.custom.colors.background,
          color: theme.custom.colors.secondary,
        }}
      >
        <ListItem
          button
          disableRipple
          className={classes.settingsContentListItem}
          onClick={() => {
            nav.push(<AddConnectWallet closeDrawer={() => close()} />);
          }}
        >
          <div
            style={{
              border: `solid ${theme.custom.colors.nav}`,
              borderRadius: "40px",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              marginRight: "12px",
            }}
          >
            <Add
              style={{
                color: theme.custom.colors.secondary,
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: "14px",
              }}
            />
          </div>
          <Typography>Add / Connect Wallet</Typography>
        </ListItem>
      </List>
    </>
  );
}

function SettingsList() {
  const classes = useStyles();
  const theme = useTheme() as any;
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

  const listStyle = {
    color: theme.custom.colors.fontColor,
    background: theme.custom.colors.nav,
    padding: 0,
    marginLeft: "16px",
    marginRight: "16px",
    borderRadius: "8px",
  };
  const settingsMenu = [
    {
      id: 0,
      label: "Help & Support",
      onClick: () => console.log("help and support"),
      icon: (props: any) => <Help {...props} />,
      detailIcon: (props: any) => <Launch {...props} />,
    },
    {
      id: 1,
      label: "Connection",
      onClick: () => nav.push(<ConnectionMenu />),
      icon: (props: any) => <Public {...props} />,
      detailIcon: (props: any) => <ArrowForwardIos {...props} />,
    },
    {
      id: 2,
      label: "Lock Wallet",
      onClick: () => lockWallet(),
      icon: (props: any) => <Lock {...props} />,
      detailIcon: (props: any) => <></>,
    },
  ];

  return (
    <List
      style={{
        ...listStyle,
        marginTop: "24px",
        marginBottom: "16px",
      }}
    >
      {settingsMenu.map((s, idx) => {
        return (
          <ListItem
            key={s.id}
            button
            className={classes.settingsContentListItem}
            style={{
              borderBottom:
                idx !== settingsMenu.length - 1
                  ? `solid 1pt ${theme.custom.colors.border}`
                  : undefined,
            }}
            onClick={s.onClick}
          >
            <div
              style={{
                display: "flex",
                flex: 1,
              }}
            >
              {s.icon({
                style: {
                  color: theme.custom.colors.secondary,
                  marginRight: "8px",
                  height: "24px",
                  width: "24px",
                },
              })}
              <Typography
                style={{
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                {s.label}
              </Typography>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {s.detailIcon({
                style: {
                  color: theme.custom.colors.secondary,
                  fontSize: "14px",
                },
              })}
            </div>
          </ListItem>
        );
      })}
    </List>
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
