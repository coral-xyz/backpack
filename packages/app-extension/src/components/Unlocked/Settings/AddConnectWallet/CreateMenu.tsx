import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  getAddMessage,
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import {
  HardwareIcon,
  MnemonicIcon,
  PushDetail,
} from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useKeyringHasMnemonic,
  useUser,
} from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import { ethers } from "ethers";

import { Header, SubtextParagraph } from "../../../common";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

import { ConfirmCreateWallet } from "./";

const { base58 } = ethers.utils;

export function CreateMenu({ blockchain }: { blockchain: Blockchain }) {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const hasMnemonic = useKeyringHasMnemonic();
  const user = useUser();
  const [keyringExists, setKeyringExists] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { close: closeParentDrawer } = useDrawerContext();

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
      const signature = await background.request({
        method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
        params: [
          blockchain,
          walletDescriptor.publicKey,
          base58.encode(
            Buffer.from(getAddMessage(walletDescriptor.publicKey), "utf-8")
          ),
          [true, [walletDescriptor.derivationPath]],
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
  };

  const createMenu = {
    ...(hasMnemonic
      ? // TODO user should be guided through mnemonic creation flow if
        // they don't have a mnemonic
        // https://github.com/coral-xyz/backpack/issues/1464
        {
          "Secret recovery phrase": {
            onClick: createNewWithPhrase,
            icon: (props: any) => <MnemonicIcon {...props} />,
            detailIcon: <PushDetail />,
          },
        }
      : {}),
    "Hardware wallet": {
      onClick: () => {
        openConnectHardware(
          blockchain,
          // `create` gets a default account index for derivations
          // where no wallets are used, `derive` just gets the next
          // wallet in line given the existing derivation paths
          keyringExists && hasLedgerPublicKeys ? "derive" : "create"
        );
        window.close();
      },
      icon: (props: any) => <HardwareIcon {...props} />,
      detailIcon: <PushDetail />,
    },
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
          <Header text="Create a wallet" />
          <SubtextParagraph>
            Add a new wallet for @{user.username} using one of the following:
          </SubtextParagraph>
        </Box>
        <SettingsList menuItems={createMenu} />
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
