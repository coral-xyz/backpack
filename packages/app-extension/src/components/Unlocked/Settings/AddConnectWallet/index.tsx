import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  getAddMessage,
  openAddUserAccount,
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import {
  CheckIcon,
  HardwareWalletIcon,
  Loading,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useAvatarUrl,
  useBackgroundClient,
  useKeyringType,
  useUser,
  useWalletName,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import { ethers } from "ethers";

import { Header, SubtextParagraph } from "../../../common";
import { ActionCard } from "../../../common/Layout/ActionCard";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";
import { WalletListItem } from "../YourAccount/EditWallets";

const { base58 } = ethers.utils;

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
          separate wallet, create a new account.
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
          label={`Create a new account`}
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
  const background = useBackgroundClient();
  const [keyringExists, setKeyringExists] = useState(false);

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [nav.setOptions]);

  useEffect(() => {
    (async () => {
      const blockchainKeyrings = await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
        params: [],
      });
      setKeyringExists(blockchainKeyrings.includes(blockchain));
    })();
  }, [blockchain]);

  // If a public key prop exists then attempting to recover an existing wallet
  if (publicKey) {
    return (
      <RecoverWalletMenu
        blockchain={blockchain}
        publicKey={publicKey}
        keyringExists={keyringExists}
      />
    );
  } else {
    return (
      <AddWalletMenu
        blockchain={blockchain}
        keyringExists={keyringExists}
        setKeyringExists={setKeyringExists}
      />
    );
  }
}

export function AddWalletMenu({
  blockchain,
  keyringExists,
  setKeyringExists,
}: {
  blockchain: Blockchain;
  keyringExists: boolean;
  setKeyringExists: (exists: boolean) => void;
}) {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const keyringType = useKeyringType();
  const theme = useCustomTheme();
  const [newPublicKey, setNewPublicKey] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { close: closeParentDrawer } = useDrawerContext();

  // Lock to ensure that the create new wallet button cannot be accidentally
  // spammed or double clicked, which is undesireable as it creates more wallets
  // than the user expects.
  const [lockCreateButton, setLockCreateButton] = useState(false);
  // If the keyring or if we don't have any public keys of the type we are
  // adding then additional logic is required to select the account index of
  // the first derivation path added
  const [hasHdPublicKeys, setHasHdPublicKeys] = useState(false);
  const [hasLedgerPublicKeys, setHasLedgerPublicKeys] = useState(false);

  useEffect(() => {
    (async () => {
      const publicKeys = await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
        params: [],
      });
      const blockchainPublicKeys = publicKeys[blockchain];
      if (blockchainPublicKeys) {
        setHasHdPublicKeys(blockchainPublicKeys.hdPublicKeys.length > 0);
        setHasLedgerPublicKeys(
          blockchainPublicKeys.ledgerPublicKeys.length > 0
        );
      }
    })();
  }, [blockchain]);

  const createNew = async () => {
    // Mnemonic based keyring. This is the simple case because we don't
    // need to prompt for the user to open their Ledger app to get the
    // required public key. We also don't need a signature to prove
    // ownership of the public key because that can't be done
    // transparently by the backend.
    if (lockCreateButton) {
      return;
    }
    setOpenDrawer(true);
    setLoading(true);
    setLockCreateButton(true);
    let newPublicKey;
    if (!keyringExists || !hasHdPublicKeys) {
      // No keyring or no existing mnemonic public keys so can't derive next
      const walletDescriptor = await background.request({
        method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
        params: [blockchain, 0],
      });
      const signature = await background.request({
        method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
        params: [
          blockchain,
          walletDescriptor.publicKey,
          base58.encode(
            Buffer.from(getAddMessage(walletDescriptor.publicKey), "utf-8")
          ),
        ],
      });
      await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
        params: [blockchain, { ...walletDescriptor, signature }],
      });
      newPublicKey = walletDescriptor.publicKey;
      // Keyring now exists, toggle to other options
      setKeyringExists(true);
    } else {
      newPublicKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
        params: [blockchain],
      });
    }
    setNewPublicKey(newPublicKey);
    setLoading(false);
    setLockCreateButton(false);
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
          <Header text="Add or connect a wallet" />
          <SubtextParagraph>
            Add a new wallet associated with your Backpack account.
          </SubtextParagraph>
        </Box>
        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            {keyringType === "mnemonic" && (
              <Grid item xs={12}>
                <ActionCard
                  text="Secret recovery phrase"
                  subtext="Create a new wallet using your secret recovery phrase."
                  onClick={createNew}
                />
              </Grid>
            )}
            {(keyringType === "ledger" || keyringExists) && (
              <Grid item xs={12}>
                <ActionCard
                  text="Hardware wallet"
                  subtext="Create a new wallet using a hardware wallet."
                  onClick={() => {
                    openConnectHardware(
                      blockchain,
                      // `create` gets a default account index for derivations
                      // where no wallets are used, `derive` just gets the next
                      // wallet in line given the existing derivation paths
                      keyringExists && hasLedgerPublicKeys ? "derive" : "create"
                    );
                    window.close();
                  }}
                />
              </Grid>
            )}
            {keyringExists && (
              <Grid item xs={12}>
                <ActionCard
                  text="Advanced import"
                  subtext="Import existing wallets using a seed phrase, hardware wallet, or private key."
                  onClick={() => nav.push("import-wallet", { blockchain })}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </div>
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

export function RecoverWalletMenu({
  blockchain,
  keyringExists,
  publicKey,
}: {
  blockchain: Blockchain;
  keyringExists: boolean;
  publicKey: string;
}) {
  const nav = useNavigation();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { close: closeParentDrawer } = useDrawerContext();

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
          <Header text="Recover a wallet" />
          <SubtextParagraph>
            Recover a wallet associated with your Backpack account.
          </SubtextParagraph>
        </Box>
        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            {keyringExists && (
              <Grid item xs={6}>
                <ActionCard
                  icon={
                    <ArrowCircleDown
                      style={{
                        color: theme.custom.colors.icon,
                      }}
                    />
                  }
                  text="Recover using private key"
                  onClick={() =>
                    nav.push("import-secret-key", {
                      blockchain,
                      publicKey,
                    })
                  }
                />
              </Grid>
            )}
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <HardwareWalletIcon
                    fill={theme.custom.colors.icon}
                    style={{
                      width: "24px",
                      height: "24px",
                    }}
                  />
                }
                text="Recover using hardware wallet"
                onClick={() => {
                  openConnectHardware(blockchain, "search", publicKey);
                  window.close();
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
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
        <ConfirmCreateWallet
          blockchain={blockchain}
          publicKey={publicKey}
          onClose={() => {
            setOpenDrawer(false);
            closeParentDrawer();
          }}
        />
      </WithMiniDrawer>
    </>
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
              isFirst={true}
              isLast={true}
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
