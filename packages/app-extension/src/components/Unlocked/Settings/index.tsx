import { useEffect, useState, Suspense } from "react";
import * as bs58 from "bs58";
import { Box, Typography, IconButton } from "@mui/material";
import {
  Add,
  Lock,
  Help,
  AccountCircleOutlined,
  Tab as WindowIcon,
  Settings,
} from "@mui/icons-material";
import { Keypair } from "@solana/web3.js";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  useBackgroundClient,
  useWalletPublicKeys,
  useActiveWallet,
} from "@coral-xyz/recoil";
import {
  openPopupWindow,
  toTitleCase,
  Blockchain,
  BACKPACK_FEATURE_POP_MODE,
  BACKPACK_FEATURE_MULTICHAIN,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import {
  Header,
  List,
  ListItem,
  PushDetail,
  LaunchDetail,
  PrimaryButton,
  SubtextParagraph,
  TextField,
  WalletAddress,
} from "../../../components/common";
import {
  WithDrawer,
  CloseButton,
  useDrawerContext,
  WithMiniDrawer,
} from "../../common/Layout/Drawer";
import {
  useNavStack,
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import {
  ShowPrivateKeyWarning,
  ShowPrivateKey,
} from "./YourAccount/ShowPrivateKey";
import {
  ShowRecoveryPhraseWarning,
  ShowRecoveryPhrase,
} from "./YourAccount/ShowRecoveryPhrase";
import { Preferences } from "./Preferences";
import { PreferencesAutoLock } from "./Preferences/AutoLock";
import { PreferencesTrustedApps } from "./Preferences/TrustedApps";
import { PreferencesSolanaConnection } from "./Preferences/Solana/ConnectionSwitch";
import { PreferencesSolanaCommitment } from "./Preferences/Solana/Commitment";
import { PreferencesSolanaExplorer } from "./Preferences/Solana/Explorer";
import { ChangePassword } from "./YourAccount/ChangePassword";
import { ResetWarning } from "../../Locked/Reset/ResetWarning";
import { Reset } from "../../Locked/Reset";
import { RecentActivityButton } from "../../Unlocked/Balances/RecentActivity";
import { AddConnectWalletMenu, ConfirmCreateWallet } from "./AddConnectWallet";
import { YourAccount } from "./YourAccount";
import { EditWallets } from "./YourAccount/EditWallets";
import { RemoveWallet } from "./YourAccount/EditWallets/RemoveWallet";
import { RenameWallet } from "./YourAccount/EditWallets/RenameWallet";
import { WalletDetail } from "./YourAccount/EditWallets/WalletDetail";

const useStyles = styles((theme) => ({
  addConnectWalletLabel: {
    color: theme.custom.colors.fontColor,
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
  addConnectRoot: {
    background: "transparent !important",
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
  const theme = useCustomTheme();
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
      <WithDrawer openDrawer={settingsOpen} setOpenDrawer={setSettingsOpen}>
        <div
          style={{ height: "100%", background: theme.custom.colors.background }}
        >
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={(args) => ({ title: "" })}
            navButtonRight={
              <CloseButton onClick={() => setSettingsOpen(false)} />
            }
          >
            <NavStackScreen
              name={"root"}
              component={(props: any) => <SettingsMenu {...props} />}
            />
            <NavStackScreen
              name={"add-connect-wallet"}
              component={(props: any) => <AddConnectWalletMenu {...props} />}
            />
            <NavStackScreen
              name={"import-secret-key"}
              component={(props: any) => <ImportSecretKey {...props} />}
            />
            <NavStackScreen
              name={"your-account"}
              component={(props: any) => <YourAccount {...props} />}
            />
            <NavStackScreen
              name={"preferences"}
              component={(props: any) => <Preferences {...props} />}
            />
            <NavStackScreen
              name={"preferences-auto-lock"}
              component={(props: any) => <PreferencesAutoLock {...props} />}
            />
            <NavStackScreen
              name={"preferences-trusted-apps"}
              component={(props: any) => <PreferencesTrustedApps {...props} />}
            />
            <NavStackScreen
              name={"preferences-solana-rpc-connection"}
              component={(props: any) => (
                <PreferencesSolanaConnection {...props} />
              )}
            />
            <NavStackScreen
              name={"preferences-solana-commitment"}
              component={(props: any) => (
                <PreferencesSolanaCommitment {...props} />
              )}
            />
            <NavStackScreen
              name={"preferences-solana-explorer"}
              component={(props: any) => (
                <PreferencesSolanaExplorer {...props} />
              )}
            />
            <NavStackScreen
              name={"change-password"}
              component={(props: any) => <ChangePassword {...props} />}
            />
            <NavStackScreen
              name={"edit-wallets"}
              component={(props: any) => <EditWallets {...props} />}
            />
            <NavStackScreen
              name={"edit-wallets-wallet-detail"}
              component={(props: any) => <WalletDetail {...props} />}
            />
            <NavStackScreen
              name={"edit-wallets-remove"}
              component={(props: any) => <RemoveWallet {...props} />}
            />
            <NavStackScreen
              name={"edit-wallets-rename"}
              component={(props: any) => <RenameWallet {...props} />}
            />
            <NavStackScreen
              name={"show-private-key-warning"}
              component={(props: any) => <ShowPrivateKeyWarning {...props} />}
            />
            <NavStackScreen
              name={"show-private-key"}
              component={(props: any) => <ShowPrivateKey {...props} />}
            />
            <NavStackScreen
              name={"show-secret-phrase-warning"}
              component={(props: any) => (
                <ShowRecoveryPhraseWarning {...props} />
              )}
            />
            <NavStackScreen
              name={"show-secret-phrase"}
              component={(props: any) => <ShowRecoveryPhrase {...props} />}
            />
            <NavStackScreen
              name={"reset-warning"}
              component={(props: any) => <ResetWarning {...props} />}
            />
            <NavStackScreen
              name={"reset"}
              component={(props: any) => <Reset {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </div>
  );
}

function SettingsMenu() {
  const theme = useCustomTheme();
  const { setTitle, setStyle, setContentStyle } = useNavStack();

  useEffect(() => {
    setTitle("");
    setStyle({
      backgroundColor: theme.custom.colors.background,
    });
    setContentStyle({
      backgroundColor: theme.custom.colors.background,
    });
  }, [setTitle, setStyle, setContentStyle, theme.custom.colors.background]);

  return (
    <Suspense fallback={<div></div>}>
      <_SettingsContent />
    </Suspense>
  );
}

function _SettingsContent() {
  const { close } = useDrawerContext();
  return (
    <div>
      <AvatarHeader />
      <WalletLists close={close} />
      <SettingsList close={close} />
    </div>
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

function WalletLists({ close }: { close: () => void }) {
  const blockchainKeyrings = useWalletPublicKeys();
  return (
    <>
      {Object.entries(blockchainKeyrings).map(([blockchain, keyring]) => (
        <WalletList
          key={blockchain}
          blockchain={blockchain as Blockchain}
          keyring={keyring}
          close={close}
        />
      ))}
    </>
  );
}

function WalletList({
  blockchain,
  keyring,
  close,
}: {
  blockchain: Blockchain;
  keyring: any;
  close: () => void;
}) {
  const background = useBackgroundClient();

  const clickWallet = (publicKey: string) => {
    background
      .request({
        method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
        params: [publicKey],
      })
      .then((_resp) => close())
      .catch(console.error);
  };

  const keys = keyring.hdPublicKeys
    .concat(keyring.importedPublicKeys)
    .concat(keyring.ledgerPublicKeys)
    .filter((k: any) => k !== undefined);

  return (
    <div style={{ marginBottom: "16px" }}>
      {BACKPACK_FEATURE_MULTICHAIN && (
        <Typography
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "12px",
          }}
        >
          {toTitleCase(blockchain)}
        </Typography>
      )}
      <List>
        {keys.map(
          (
            { name, publicKey }: { name: string; publicKey: string },
            idx: number
          ) => {
            return (
              <ListItem
                key={publicKey.toString()}
                onClick={() => clickWallet(publicKey)}
                isFirst={idx === 0}
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
          }
        )}
      </List>
      <AddConnectWalletButton blockchain={blockchain} />
    </div>
  );
}

export const AddConnectWalletButton = ({
  blockchain,
}: {
  blockchain: Blockchain;
}) => {
  const nav = useNavStack();
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <List
      style={{
        background: theme.custom.colors.background,
        color: theme.custom.colors.secondary,
      }}
    >
      <ListItem
        isFirst={true}
        isLast={true}
        onClick={() => nav.push("add-connect-wallet", { blockchain })}
        classes={{ root: classes.addConnectRoot }}
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
              color: "inherit",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "14px",
            }}
          />
        </div>
        <Typography
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          Add / Connect Wallet
        </Typography>
      </ListItem>
    </List>
  );
};

function SettingsList({ close }: { close: () => void }) {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();

  const lockWallet = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error);
  };

  const settingsMenu = [
    {
      label: "Your Account",
      onClick: () => nav.push("your-account"),
      icon: (props: any) => <AccountCircleOutlined {...props} />,
      detailIcon: <PushDetail />,
    },
    {
      label: "Preferences",
      onClick: () => nav.push("preferences"),
      icon: (props: any) => <Settings {...props} />,
      detailIcon: <PushDetail />,
    },
    {
      label: "Help & Support",
      onClick: () => console.log("help and support"),
      icon: (props: any) => <Help {...props} />,
      detailIcon: <LaunchDetail />,
    },
  ];
  if (BACKPACK_FEATURE_POP_MODE) {
    settingsMenu.push({
      label: "Pop Window",
      onClick: () => {
        openPopupWindow("popup.html");
        window.close();
      },
      icon: (props: any) => <WindowIcon {...props} />,
      detailIcon: <LaunchDetail />,
    });
  }
  settingsMenu.push({
    label: "Lock Wallet",
    onClick: () => lockWallet(),
    icon: (props: any) => <Lock {...props} />,
    detailIcon: <></>,
  });

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
            isFirst={idx === 0}
            isLast={idx === settingsMenu.length - 1}
            onClick={s.onClick}
            id={s.label}
            style={{
              height: "44px",
              padding: "10px",
            }}
            detail={s.detailIcon}
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
          </ListItem>
        );
      })}
    </List>
  );
}

export function ImportSecretKey({ blockchain }: { blockchain: Blockchain }) {
  const background = useBackgroundClient();
  const nav = useNavStack();
  const theme = useCustomTheme();
  const [name, setName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    const prevStyle = nav.style;
    const prevContentStyle = nav.contentStyle;
    const prevTitle = nav.title;
    nav.setStyle({
      backgroundColor: theme.custom.colors.nav,
    });
    nav.setContentStyle({
      backgroundColor: theme.custom.colors.nav,
    });
    nav.setTitle("");
    return () => {
      nav.setStyle(prevStyle);
      nav.setContentStyle(prevContentStyle);
      nav.setTitle(prevTitle);
    };
  }, [theme]);

  const onClick = async () => {
    const kp = decodeAccount(secretKey);
    if (!kp) {
      setError("Invalid private key");
      return;
    }
    const secretKeyHex = Buffer.from(kp.secretKey).toString("hex");

    const publicKey = await background.request({
      method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
      params: [blockchain, secretKeyHex, name],
    });

    await background.request({
      method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
      params: [publicKey],
    });

    setOpenDrawer(true);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ margin: "24px 0" }}>
          <Box sx={{ margin: "0 24px" }}>
            <Header text="Import private key" />
            <SubtextParagraph style={{ marginBottom: "32px" }}>
              Enter your private key. It will be encrypted and stored on your
              device.
            </SubtextParagraph>
          </Box>
          <Box sx={{ margin: "0 16px" }}>
            <Box sx={{ marginBottom: "4px" }}>
              <TextField
                autoFocus={true}
                placeholder="Name"
                value={name}
                setValue={setName}
              />
            </Box>
            <TextField
              placeholder="Enter private key"
              value={secretKey}
              setValue={setSecretKey}
              rows={4}
            />
          </Box>
          {error && (
            <Typography style={{ color: "red", marginTop: "8px" }}>
              {error}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <PrimaryButton
            onClick={onClick}
            label="Import"
            disabled={secretKey.length === 0}
          />
        </Box>
      </Box>
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
      >
        <ConfirmCreateWallet setOpenDrawer={setOpenDrawer} />
      </WithMiniDrawer>
    </>
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
