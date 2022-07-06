import { useEffect, useState, Suspense } from "react";
import * as bs58 from "bs58";
import { Typography, IconButton, Button, TextField } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  Add,
  Lock,
  Help,
  Public,
  ArrowForwardIos,
  Launch,
  AccountCircleOutlined,
} from "@mui/icons-material";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  useBackgroundClient,
  useEphemeralNav,
  useKeyringStoreState,
  useWalletPublicKeys,
  useActiveWallet,
  KeyringStoreStateEnum,
} from "@coral-xyz/recoil";
import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import {
  WalletAddress,
  List,
  ListItem,
  PrimaryButton,
} from "../../components/common";
import { WithEphemeralNavDrawer } from "../Layout/Drawer";
import { ConnectionMenu } from "./ConnectionSwitch";
import { RecentActivityButton } from "../Unlocked/Balances/RecentActivity";
import { AddConnectWallet } from "./AddConnectWallet";
import { YourAccount } from "./YourAccount";

const useStyles = styles((theme) => ({
  addConnectWalletLabel: {
    color: theme.custom.colors.fontColor,
  },
  settingsContainer: {
    height: "100%",
  },
  menuButtonContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  menuButton: {
    padding: 0,
    "&:hover": {
      background: "transparent",
    },
  },
}));

const AVATAR_URL = "/coral.png";

export function SettingsButton() {
  return (
    <div style={{ display: "flex" }}>
      <RecentActivityButton />
      <div style={{ width: "16px" }} />
      <AvatarButton />
    </div>
  );
}

function AvatarButton() {
  const classes = useStyles();
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className={classes.menuButtonContainer}>
      <IconButton
        disableRipple
        className={classes.menuButton}
        onClick={() => setSettingsOpen(!settingsOpen)}
        size="large"
        id="menu-button"
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
      <WithEphemeralNavDrawer
        openDrawer={settingsOpen}
        setOpenDrawer={setSettingsOpen}
        title={""}
        navbarStyle={{ borderBottom: undefined }}
      >
        <SettingsContent close={() => setSettingsOpen(false)} />
      </WithEphemeralNavDrawer>
    </div>
  );
}

function SettingsContent({ close }: { close: () => void }) {
  const { setTitle, setStyle } = useEphemeralNav();
  useEffect(() => {
    setTitle("");
    setStyle({});
  }, []);
  return (
    <Suspense fallback={<div></div>}>
      <_SettingsContent close={close} />
    </Suspense>
  );
}

type SettingsPage = "menu" | "add-connect-wallet";

function _SettingsContent({ close }: { close: () => void }) {
  const classes = useStyles();
  const keyringStoreState = useKeyringStoreState();
  const [page, setPage] = useState<SettingsPage>("menu");

  return (
    <>
      {page === "menu" && (
        <div className={classes.settingsContainer}>
          <AvatarHeader />
          {keyringStoreState === KeyringStoreStateEnum.Unlocked && (
            <WalletList
              onAddConnectWallet={() => setPage("add-connect-wallet")}
              close={close}
            />
          )}
          <SettingsList close={close} />
        </div>
      )}
      {page === "add-connect-wallet" && (
        <AddConnectWallet onAddSuccess={close} close={() => setPage("menu")} />
      )}
    </>
  );
}

function AvatarHeader() {
  const activeWallet = useActiveWallet();
  const theme = useCustomTheme();
  return (
    <div>
      <img
        src={"coral.png"}
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

function WalletList({
  onAddConnectWallet,
  close,
}: {
  onAddConnectWallet: () => void;
  close: () => void;
}) {
  const background = useBackgroundClient();
  const theme = useCustomTheme();
  const namedPublicKeys = useWalletPublicKeys();

  const clickWallet = (publicKey: PublicKey) => {
    background
      .request({
        method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
        params: [publicKey.toString()],
      })
      .then((_resp) => close())
      .catch(console.error);
  };

  const keys = namedPublicKeys.hdPublicKeys
    .concat(namedPublicKeys.importedPublicKeys)
    .concat(namedPublicKeys.ledgerPublicKeys);

  return (
    <>
      <List>
        {keys.map(({ name, publicKey }, idx: number) => {
          return (
            <ListItem
              key={publicKey.toString()}
              onClick={() => clickWallet(publicKey)}
              isLast={idx === keys.length - 1}
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
          background: theme.custom.colors.background,
          color: theme.custom.colors.secondary,
        }}
      >
        <ListItem isLast={true} onClick={onAddConnectWallet}>
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

function SettingsList({ close }: { close: () => void }) {
  const theme = useCustomTheme();
  const nav = useEphemeralNav();
  const background = useBackgroundClient();

  const lockWallet = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error)
      .then(() => close());
  };

  const settingsMenu = [
    {
      label: "Your Account",
      onClick: () => nav.push(<YourAccount close={close} />),
      icon: (props: any) => <AccountCircleOutlined {...props} />,
      detailIcon: (props: any) => <ArrowForwardIos {...props} />,
    },
    {
      label: "Help & Support",
      onClick: () => console.log("help and support"),
      icon: (props: any) => <Help {...props} />,
      detailIcon: (props: any) => <Launch {...props} />,
    },
    {
      label: "Connection",
      onClick: () => nav.push(<ConnectionMenu close={close} />),
      icon: (props: any) => <Public {...props} />,
      detailIcon: (props: any) => <ArrowForwardIos {...props} />,
    },
    {
      label: "Lock Wallet",
      onClick: () => lockWallet(),
      icon: (props: any) => <Lock {...props} />,
      detailIcon: (props: any) => <></>,
    },
  ];

  return (
    <List
      style={{
        marginTop: "24px",
        marginBottom: "16px",
      }}
    >
      {settingsMenu.map((s, idx) => {
        return (
          <ListItem
            key={s.label}
            isLast={idx === settingsMenu.length - 1}
            onClick={s.onClick}
            id={s.label}
            style={{
              height: "44px",
            }}
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

export function ImportSecretKey({
  onNext,
}: {
  onNext: (secretKey: string, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  const next = () => {
    const kp = decodeAccount(secretKey);
    if (!kp) {
      setError("Invalid private key");
      return;
    }
    const secretKeyHex = Buffer.from(kp.secretKey).toString("hex");
    onNext(secretKeyHex, name);
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
      <PrimaryButton onClick={next} label="Import" />
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
