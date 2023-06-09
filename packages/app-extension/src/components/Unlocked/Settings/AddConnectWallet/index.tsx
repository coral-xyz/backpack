import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  getAddMessage,
  openAddUserAccount,
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
} from "@coral-xyz/common";
import {
  CheckIcon,
  HardwareIcon,
  ImportedIcon,
  Loading,
  MnemonicIcon,
  PlusCircleIcon,
  PrimaryButton,
  ProxyImage,
  PushDetail,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useAvatarUrl,
  useBackgroundClient,
  useEnabledBlockchains,
  useKeyringHasMnemonic,
  useRpcRequests,
  useUser,
  useWalletName,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";
import { WalletListItem } from "../YourAccount/EditWallets";

export function AddConnectPreview() {
  const nav = useNavigation();
  const user = useUser();
  const avatarUrl = useAvatarUrl(72, user.username);
  const theme = useCustomTheme();
  const { close } = useDrawerContext();

  useEffect(() => {
    nav.setOptions({ headerTitle: "" });
  }, [nav]);

  return (
    <div
      style={{
        height: "100%",
        justifyContent: "space-between",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <div>
        <ProxyImage
          src={avatarUrl}
          loadingStyles={{
            margin: "8px auto 16px auto",
            height: "72px",
            width: "72px",
            display: "block",
          }}
          style={{
            marginBottom: "16px",
            marginTop: "8px",
            width: "72px",
            borderRadius: "36px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
          }}
        />
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontSize: "24px",
            fontWeight: 500,
            textAlign: "center",
            marginLeft: "32px",
            marginRight: "32px",
          }}
        >
          Your new wallet will be associated with @{user.username}
        </Typography>
        <Typography
          style={{
            marginLeft: "32px",
            marginRight: "32px",
            marginTop: "8px",
            fontSize: "16px",
            fontWeight: 500,
            color: theme.custom.colors.secondary,
            textAlign: "center",
          }}
        >
          This connection will be public, so if you'd prefer to create a
          separate identity, create a new account.
        </Typography>
      </div>
      <div
        style={{
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <PrimaryButton
          label={`Continue as @${user.username}`}
          onClick={() => nav.push("edit-wallets-blockchain-selector")}
        />
        <SecondaryButton
          label="Create a new account"
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            backgroundColor: "transparent",
          }}
          onClick={() => {
            close();
            openAddUserAccount();
          }}
        />
      </div>
    </div>
  );
}

export function AddConnectWalletMenu({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey?: string;
}) {
  const nav = useNavigation();

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [nav]);

  // If a public key prop exists then attempting to recover an existing wallet
  if (publicKey) {
    return <RecoverWalletMenu blockchain={blockchain} publicKey={publicKey} />;
  } else {
    return <AddWalletMenu blockchain={blockchain} />;
  }
}

function AddWalletMenu({ blockchain }: { blockchain: Blockchain }) {
  const navigation = useNavigation();
  const user = useUser();

  const nav = useNavigation();
  const drawer = useDrawerContext();
  const background = useBackgroundClient();
  const hasMnemonic = useKeyringHasMnemonic();
  const { close: closeParentDrawer } = useDrawerContext();
  const { signMessageForWallet } = useRpcRequests();
  const publicKeys = useWalletPublicKeys();
  const keyringExists = publicKeys[blockchain];
  // If the keyring or if we don't have any public keys of the type we are
  // adding then additional logic is required to select the account index of
  // the first derivation path added
  const hasHdPublicKeys =
    publicKeys?.[blockchain]?.["hdPublicKeys"]?.length > 0;

  const [newPublicKey, setNewPublicKey] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  const createNewWithPhrase = async () => {
    // Mnemonic based keyring. This is the simple case because we don't
    // need to prompt for the user to open their Ledger app to get the
    // required public key. We also don't need a signature to prove
    // ownership of the public key because that can't be done
    // transparently by the backend.
    if (loading) {
      return;
    }

    setOpenDrawer(true);
    setLoading(true);
    let newPublicKey;
    if (!keyringExists || !hasHdPublicKeys) {
      // No keyring or no existing mnemonic public keys so can't derive next
      const walletDescriptor = await background.request({
        method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
        params: [blockchain, 0],
      });
      const signature = await signMessageForWallet(
        blockchain,
        walletDescriptor.publicKey,
        getAddMessage(walletDescriptor.publicKey),
        {
          mnemonic: true,
          signedWalletDescriptors: [
            {
              ...walletDescriptor,
              signature: "",
            },
          ],
        }
      );
      const signedWalletDescriptor = { ...walletDescriptor, signature };
      if (!keyringExists) {
        // Keyring doesn't exist, create it
        await background.request({
          method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
          params: [
            {
              mnemonic: true, // Use the existing mnemonic
              signedWalletDescriptors: [signedWalletDescriptor],
            },
          ],
        });
      } else {
        // Keyring exists but the hd keyring is not initialised, import
        await background.request({
          method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
          params: [signedWalletDescriptor],
        });
      }
      newPublicKey = walletDescriptor.publicKey;
    } else {
      newPublicKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
        params: [blockchain],
      });
    }
    setNewPublicKey(newPublicKey);
    setLoading(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ margin: "24px" }}>
          <Header text="Create or import a wallet" />
          <SubtextParagraph>
            Add a new wallet for @{user.username} on Backpack.
          </SubtextParagraph>
        </Box>
        <SettingsList
          menuItems={{
            [hasMnemonic ? "Create a new wallet" : "Setup recovery phrase"]: {
              onClick: () =>
                hasMnemonic
                  ? createNewWithPhrase()
                  : nav.push("create-or-import-mnemonic", {
                      blockchain,
                      keyringExists,
                    }),
              icon: (props: any) => <PlusCircleIcon {...props} />,
            },
            "Advanced wallet import": {
              onClick: () => navigation.push("import-wallet", { blockchain }),
              icon: (props: any) => <ImportedIcon {...props} />,
            },
          }}
        />
      </div>
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(open: boolean) => {
          setOpenDrawer(open);
          if (!open) {
            drawer.close();
          }
        }}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
      >
        <ConfirmCreateWallet
          blockchain={blockchain}
          publicKey={newPublicKey}
          onClose={() => {
            setOpenDrawer(false);
            closeParentDrawer();
          }}
          isLoading={loading}
        />
      </WithMiniDrawer>
    </>
  );
}

function RecoverWalletMenu({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}) {
  const nav = useNavigation();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringExists = enabledBlockchains.includes(blockchain);

  const recoverMenu = {
    "Other recovery phrase": {
      onClick: () =>
        nav.push("import-from-mnemonic", {
          blockchain,
          inputMnemonic: true,
          keyringExists,
          publicKey,
        }),
      icon: (props: any) => <MnemonicIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Private key": {
      onClick: () =>
        nav.push("import-from-secret-key", {
          blockchain,
          publicKey,
        }),
      icon: (props: any) => <PlusCircleIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Hardware wallet": {
      onClick: () => {
        openConnectHardware(blockchain, "search", publicKey);
        window.close();
      },
      icon: (props: any) => <HardwareIcon {...props} />,
      detailIcon: <PushDetail />,
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ margin: "24px" }}>
        <Header text="Recover a wallet" />
        <SubtextParagraph>
          Recover a wallet using one of the following:
        </SubtextParagraph>
      </Box>
      <SettingsList menuItems={recoverMenu} />
    </div>
  );
}

export const ConfirmCreateWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  onClose: () => void;
  isLoading?: boolean;
}> = ({ blockchain, publicKey, onClose, isLoading = false }) => {
  const theme = useCustomTheme();
  const walletName = useWalletName(publicKey);

  return (
    <div
      style={{
        height: "232px",
        backgroundColor: theme.custom.colors.bg2,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div>
            <Typography
              style={{
                marginTop: "16px",
                textAlign: "center",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "24px",
                color: theme.custom.colors.fontColor,
              }}
            >
              Wallet Created
            </Typography>
            <div
              style={{
                textAlign: "center",
                marginTop: "24px",
              }}
            >
              <CheckIcon />
            </div>
          </div>
          <div>
            <WalletListItem
              blockchain={blockchain}
              name={walletName}
              publicKey={publicKey}
              showDetailMenu={false}
              isFirst
              isLast
              onClick={() => {
                onClose();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
