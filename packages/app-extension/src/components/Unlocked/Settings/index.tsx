import { Suspense, useEffect, useState } from "react";
import {
  BACKPACK_FEATURE_POP_MODE,
  BACKPACK_FEATURE_XNFT,
  Blockchain,
  DISCORD_INVITE_LINK,
  MESSAGES_ENABLED,
  NAV_COMPONENT_CONTACTS,
  NOTIFICATIONS_ENABLED,
  openPopupWindow,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
} from "@coral-xyz/common";
import { NAV_COMPONENT_NFT_CHAT } from "@coral-xyz/common/dist/esm/constants";
import {
  ContactsIcon,
  DiscordIcon,
  GridIcon,
  LaunchDetail,
  List,
  ListItem,
  PrimaryButton,
  ProxyImage,
  PushDetail,
  TextInput,
} from "@coral-xyz/react-common";
import type { WalletPublicKeys } from "@coral-xyz/recoil";
import {
  useActiveWallets,
  useAvatarUrl,
  useBackgroundClient,
  useBlockchainLogo,
  useFeatureGates,
  useNavigation,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import {
  AccountCircleOutlined,
  Add,
  ExpandLess,
  ExpandMore,
  Lock,
  Settings,
  Tab as WindowIcon,
} from "@mui/icons-material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Box, IconButton, Typography } from "@mui/material";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import { ethers } from "ethers";

import {
  Header,
  SubtextParagraph,
  WalletAddress,
} from "../../../components/common";
import {
  AllWalletsList,
  ImportTypeBadge,
  WalletList as _WalletList,
  WalletListBlockchainSelector,
} from "../../../components/common/WalletList";
import {
  CloseButton,
  useDrawerContext,
  WithDrawer,
  WithMiniDrawer,
} from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavStack,
} from "../../common/Layout/NavStack";
import { Logout, ResetWarning } from "../../Locked/Reset/ResetWarning";
import { ResetWelcome } from "../../Locked/Reset/ResetWelcome";
import { RecentActivityButton } from "../../Unlocked/Balances/RecentActivity";
import { NotificationButton } from "../Balances/Notifications";
import { Contacts } from "../Messages/Contacts";

import { AvatarHeader } from "./AvatarHeader/AvatarHeader";
import { PreferencesAutoLock } from "./Preferences/AutoLock";
import { PreferencesEthereum } from "./Preferences/Ethereum";
import { PreferencesEthereumConnection } from "./Preferences/Ethereum/Connection";
import { PreferenceEthereumCustomRpcUrl } from "./Preferences/Ethereum/CustomRpcUrl";
import { PreferencesSolana } from "./Preferences/Solana";
import { PreferencesSolanaCommitment } from "./Preferences/Solana/Commitment";
import { PreferencesSolanaConnection } from "./Preferences/Solana/ConnectionSwitch";
import { PreferenceSolanaCustomRpcUrl } from "./Preferences/Solana/CustomRpcUrl";
import { PreferencesSolanaExplorer } from "./Preferences/Solana/Explorer";
import { PreferencesTrustedSites } from "./Preferences/TrustedSites";
import { XnftDetail } from "./Xnfts/Detail";
import { ChangePassword } from "./YourAccount/ChangePassword";
import { RemoveWallet } from "./YourAccount/EditWallets/RemoveWallet";
import { RenameWallet } from "./YourAccount/EditWallets/RenameWallet";
import { WalletDetail } from "./YourAccount/EditWallets/WalletDetail";
import {
  ShowPrivateKey,
  ShowPrivateKeyWarning,
} from "./YourAccount/ShowPrivateKey";
import {
  ShowRecoveryPhrase,
  ShowRecoveryPhraseWarning,
} from "./YourAccount/ShowRecoveryPhrase";
import {
  AddConnectPreview,
  AddConnectWalletMenu,
  ConfirmCreateWallet,
} from "./AddConnectWallet";
import { Preferences } from "./Preferences";
import { UserAccountsMenuButton } from "./UsernamesMenu";
import { XnftSettings } from "./Xnfts";
import { YourAccount } from "./YourAccount";

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
    padding: "2px",
    background: `${theme.custom.colors.avatarIconBackground} !important`,
    "&:hover": {
      background: `${theme.custom.colors.avatarIconBackground} !important`,
      backgroundColor: `${theme.custom.colors.avatarIconBackground} !important`,
      opacity: HOVER_OPACITY,
    },
  },
  addConnectRoot: {
    background: "transparent !important",
    height: "48px",
    "&:hover": {
      color: `${theme.custom.colors.fontColor} !important`,
      background: "transparent !important",
    },
  },
  privateKeyTextFieldRoot: {
    "& .MuiOutlinedInput-root": {
      border: theme.custom.colors.borderFull,
      "& textarea": {
        border: "none",
        borderRadius: 0,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
      "&.Mui-focused fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton} !important`,
      },
    },
  },
}));

export function SettingsButton() {
  const featureGates = useFeatureGates();
  return (
    <div style={{ display: "flex" }}>
      <RecentActivityButton />
      {featureGates[NOTIFICATIONS_ENABLED] && <NotificationButton />}
      <div style={{ width: "16px" }} />
      <AvatarButton />
    </div>
  );
}

function AvatarButton() {
  const classes = useStyles();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const avatarUrl = useAvatarUrl(32);
  // PCA test ProxyImage
  return (
    <div className={classes.menuButtonContainer}>
      <IconButton
        disableRipple
        className={classes.menuButton}
        onClick={() => setSettingsOpen(!settingsOpen)}
        size="large"
        id="menu-button"
      >
        <ProxyImage
          src={avatarUrl}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "16px",
          }}
        />
      </IconButton>
      <WithDrawer openDrawer={settingsOpen} setOpenDrawer={setSettingsOpen}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "root", title: "Profile" }}
            options={() => ({ title: "" })}
            navButtonLeft={
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
              name={"preferences-trusted-sites"}
              component={(props: any) => <PreferencesTrustedSites {...props} />}
            />
            <NavStackScreen
              name={"preferences-solana"}
              component={(props: any) => <PreferencesSolana {...props} />}
            />
            <NavStackScreen
              name={"preferences-ethereum"}
              component={(props: any) => <PreferencesEthereum {...props} />}
            />
            <NavStackScreen
              name={"preferences-solana-rpc-connection"}
              component={(props: any) => (
                <PreferencesSolanaConnection {...props} />
              )}
            />
            <NavStackScreen
              name={"preferences-solana-edit-rpc-connection"}
              component={(props: any) => (
                <PreferenceSolanaCustomRpcUrl {...props} />
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
              name={"preferences-ethereum-rpc-connection"}
              component={(props: any) => (
                <PreferencesEthereumConnection {...props} />
              )}
            />
            <NavStackScreen
              name={"preferences-ethereum-edit-rpc-connection"}
              component={(props: any) => (
                <PreferenceEthereumCustomRpcUrl {...props} />
              )}
            />
            <NavStackScreen
              name={"change-password"}
              component={(props: any) => <ChangePassword {...props} />}
            />
            <NavStackScreen
              name={"reset"}
              component={(props: any) => <ResetWelcome {...props} />}
            />
            <NavStackScreen
              name={"edit-wallets"}
              component={(props: any) => <AllWalletsList {...props} />}
            />
            <NavStackScreen
              name={"edit-wallets-add-connect-preview"}
              component={(props: any) => <AddConnectPreview {...props} />}
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
              name={"edit-wallets-blockchain-selector"}
              component={(props: any) => (
                <WalletListBlockchainSelector {...props} />
              )}
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
              name={"logout"}
              component={(props: any) => <Logout {...props} />}
            />
            <NavStackScreen
              name={"xnfts"}
              component={(props: any) => <XnftSettings {...props} />}
            />
            <NavStackScreen
              name={"xnfts-detail"}
              component={(props: any) => <XnftDetail {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </div>
  );
}

function SettingsMenu() {
  const { setTitle } = useNavStack();

  useEffect(() => {
    setTitle(<UserAccountsMenuButton />);
  }, [setTitle]);

  return (
    <Suspense fallback={<div></div>}>
      <_SettingsContent />
    </Suspense>
  );
}

function _SettingsContent() {
  return (
    <div>
      <AvatarHeader />
      <SettingsList />
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
        background: "transparent",
        color: theme.custom.colors.secondary,
        marginLeft: 0,
        marginRight: 0,
        height: "48px",
      }}
    >
      <ListItem
        isFirst={false}
        isLast={true}
        onClick={() =>
          nav.push("edit-wallets-add-connect-preview", { blockchain })
        }
        classes={{ root: classes.addConnectRoot }}
      >
        <div
          style={{
            border: `solid ${theme.custom.colors.nav}`,
            borderRadius: "40px",
            width: "30px",
            height: "30px",
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

function SettingsList() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const { push } = useNavigation();
  const background = useBackgroundClient();
  const featureGates = useFeatureGates();

  const lockWallet = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      })
      .catch(console.error);
  };

  const walletsMenu = [
    {
      label: "Wallets",
      onClick: () => nav.push("edit-wallets"),
      icon: (props: any) => <AccountBalanceWalletIcon {...props} />,
      detailIcon: <PushDetail />,
    },
  ];

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
  ];

  if (featureGates[MESSAGES_ENABLED]) {
    settingsMenu.push({
      label: "Contacts",
      onClick: () =>
        push({
          title: "Contacts",
          componentId: NAV_COMPONENT_CONTACTS,
          componentProps: {},
        }),
      icon: (props: any) => <ContactsIcon {...props} />,
      detailIcon: <PushDetail />,
    });
  }

  if (BACKPACK_FEATURE_XNFT) {
    settingsMenu.push({
      label: "xNFTs",
      onClick: () => nav.push("xnfts"),
      icon: (props: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <GridIcon
            {...props}
            style={{ ...props.style, width: "24px", height: "20px" }}
          />
        </div>
      ),
      detailIcon: <PushDetail />,
    });
  }
  if (BACKPACK_FEATURE_POP_MODE) {
    settingsMenu.push({
      label: "Pop Window",
      onClick: async () => {
        await openPopupWindow("popup.html");
        window.close();
      },
      icon: (props: any) => <WindowIcon {...props} />,
      detailIcon: <LaunchDetail />,
    });
  }
  settingsMenu.push({
    label: "Lock",
    onClick: () => lockWallet(),
    icon: (props: any) => <Lock {...props} />,
    detailIcon: <></>,
  });

  const discordList = [
    {
      label: "Need help? Hop into Discord",
      onClick: () => window.open(DISCORD_INVITE_LINK, "_blank"),
      icon: (props: any) => <DiscordIcon {...props} />,
      detailIcon: <LaunchDetail />,
    },
  ];

  return (
    <>
      <List
        style={{
          marginTop: "24px",
          marginBottom: "16px",
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
        }}
      >
        {walletsMenu.map((s, idx) => {
          return (
            <ListItem
              key={s.label}
              isFirst={idx === 0}
              isLast={idx === walletsMenu.length - 1}
              onClick={s.onClick}
              id={s.label}
              style={{
                height: "44px",
                padding: "12px",
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
                    color: theme.custom.colors.icon,
                    height: "24px",
                    width: "24px",
                  },
                  fill: theme.custom.colors.icon,
                })}
                <Typography
                  style={{
                    marginLeft: "8px",
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
      <List
        style={{
          marginTop: "12px",
          marginBottom: "16px",
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
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
                padding: "12px",
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
                    color: theme.custom.colors.icon,
                    marginRight: "8px",
                    height: "24px",
                    width: "24px",
                  },
                  fill: theme.custom.colors.icon,
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
      <List
        style={{
          marginTop: "12px",
          marginBottom: "16px",
          border: `${theme.custom.colors.borderFull}`,
          borderRadius: "10px",
        }}
      >
        {discordList.map((s, idx) => {
          return (
            <ListItem
              key={s.label}
              isFirst={idx === 0}
              isLast={idx === discordList.length - 1}
              onClick={s.onClick}
              id={s.label}
              style={{
                height: "44px",
                padding: "12px",
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
                    color: theme.custom.colors.icon,
                    height: "24px",
                    width: "24px",
                  },
                  fill: theme.custom.colors.icon,
                })}
                <Typography
                  style={{
                    marginLeft: "8px",
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
    </>
  );
}

export function ImportSecretKey({ blockchain }: { blockchain: Blockchain }) {
  const background = useBackgroundClient();
  const existingPublicKeys = useWalletPublicKeys();
  const nav = useNavStack();
  const theme = useCustomTheme();
  const [name, setName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setTitle("");
    return () => {
      nav.setTitle(prevTitle);
    };
  }, [theme]);

  useEffect(() => {
    // Clear error on form input changes
    setError(null);
  }, [name, secretKey]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    let secretKeyHex;
    try {
      secretKeyHex = validateSecretKey(
        blockchain,
        secretKey,
        existingPublicKeys
      );
    } catch (e) {
      setError((e as Error).message);
      return;
    }

    try {
      setNewPublicKey(
        await background.request({
          method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
          params: [blockchain, secretKeyHex, name],
        })
      );
      setOpenDrawer(true);
    } catch (error) {
      setError("Wallet address is used by another Backpack account.");
    }
  };

  return (
    <>
      <form
        noValidate
        onSubmit={save}
        style={{
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
              <TextInput
                autoFocus={true}
                placeholder="Name"
                value={name}
                setValue={(e) => setName(e.target.value)}
              />
            </Box>
            <TextInput
              placeholder="Enter private key"
              value={secretKey}
              setValue={(e) => {
                setSecretKey(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  save(e);
                }
              }}
              rows={4}
              error={error ? true : false}
              errorMessage={error || ""}
            />
          </Box>
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
            type="submit"
            label="Import"
            disabled={secretKey.length === 0}
          />
        </Box>
      </form>
      <WithMiniDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <ConfirmCreateWallet
          blockchain={blockchain}
          publicKey={newPublicKey}
          setOpenDrawer={setOpenDrawer}
        />
      </WithMiniDrawer>
    </>
  );
}

// Validate a secret key and return a normalised hex representation
function validateSecretKey(
  blockchain: Blockchain,
  secretKey: string,
  keyring: WalletPublicKeys
): string {
  // Extract public keys from keychain object into array of strings
  const existingPublicKeys = Object.values(keyring[blockchain])
    .map((k) => k.map((i) => i.publicKey))
    .flat();

  if (blockchain === Blockchain.SOLANA) {
    let keypair: Keypair | null = null;
    try {
      // Attempt to create a keypair from JSON secret key
      keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(secretKey)));
    } catch (_) {
      try {
        // Attempt to create a keypair from bs58 decode of secret key
        keypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(secretKey)));
      } catch (_) {
        // Failure
        throw new Error("Invalid private key");
      }
    }

    if (existingPublicKeys.includes(keypair.publicKey.toString())) {
      throw new Error("Key already exists");
    }

    return Buffer.from(keypair.secretKey).toString("hex");
  } else if (blockchain === Blockchain.ETHEREUM) {
    try {
      const wallet = new ethers.Wallet(secretKey);

      if (existingPublicKeys.includes(wallet.publicKey)) {
        throw new Error("Key already exists");
      }

      return wallet.privateKey;
    } catch (_) {
      throw new Error("Invalid private key");
    }
  }
  throw new Error("secret key validation not implemented for blockchain");
}
