import { useEffect, useState } from "react";
import type {
  Blockchain,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
  UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
} from "@coral-xyz/common";
import { CheckIcon, PrimaryButton, TextInput } from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useDehydratedWallets,
  useRpcRequests,
} from "@coral-xyz/recoil";
import { mnemonicPathToPrivateKey } from "@coral-xyz/secure-background/legacyExport";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Typography } from "@mui/material";

import { useSteps } from "../../../../hooks/useSteps";
import { Header } from "../../../common";
import { ImportWallets } from "../../../common/Account/ImportWallets";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

import { ConfirmCreateWallet } from "./";

// WARNING: this will force set the mnemonic. Only use this if no mnemonic
//          exists.
export function ImportMnemonicAutomatic() {
  const background = useBackgroundClient();
  const dehydratedWallets = useDehydratedWallets();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { close } = useDrawerContext();

  const onSync = async (mnemonic: string) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
      params: [mnemonic],
    });
    if (dehydratedWallets.length > 0) {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
        params: [dehydratedWallets],
      });
    }
  };

  return (
    <>
      <MnemonicInput
        key="MnemonicInput"
        buttonLabel="Import"
        onNext={async (mnemonic) => {
          onSync(mnemonic);
          setOpenDrawer(true);
        }}
      />
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(isOpen: boolean) => {
          setOpenDrawer(isOpen);
          if (!isOpen) {
            close();
          }
        }}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
      >
        <ConfirmWalletSync
          onClose={() => {
            setOpenDrawer(false);
            close();
          }}
        />
      </WithMiniDrawer>
    </>
  );
}

const ConfirmWalletSync = ({ onClose }: { onClose: () => void }) => {
  const theme = useCustomTheme();
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
          Recovery Phrase Set
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
      <PrimaryButton label="Done" onClick={() => onClose()} />
    </div>
  );
};

export function ImportMnemonic({
  blockchain,
  keyringExists,
  inputMnemonic,
  forceSetMnemonic,
  publicKey,
}: {
  blockchain: Blockchain;
  keyringExists: boolean;
  inputMnemonic: boolean;
  forceSetMnemonic: boolean;
  publicKey?: string;
}) {
  const nav = useNavigation();
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const { step, nextStep } = useSteps();
  const { close: closeParentDrawer } = useDrawerContext();
  const { signMessageForWallet } = useRpcRequests();
  const dehydratedWallets = useDehydratedWallets();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | true>(true);
  const [selectedPublicKey, setSelectedPublicKey] = useState<string | null>(
    publicKey ?? null
  );
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [nav, theme]);

  // TODO replace the left nav button to go to the previous step if step > 0

  const onComplete = async (signedWalletDescriptor: SignedWalletDescriptor) => {
    let publicKey: string;

    if (forceSetMnemonic) {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
        params: [mnemonic],
      });
      publicKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
        params: [signedWalletDescriptor],
      });
      const walletsToSync = dehydratedWallets.filter(
        (w) => w.publicKey !== publicKey
      );
      if (walletsToSync.length > 0) {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
          params: [walletsToSync],
        });
      }
    } else {
      if (!inputMnemonic) {
        if (keyringExists) {
          // Using the keyring mnemonic and the blockchain keyring exists, just
          // import the path
          publicKey = await background.request({
            method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
            params: [signedWalletDescriptor],
          });
        } else {
          // Blockchain keyring doesn't exist, init
          publicKey = await background.request({
            method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
            params: [
              {
                mnemonic: true,
                signedWalletDescriptors: [signedWalletDescriptor],
              },
            ],
          });
        }
      } else {
        // Not using the keyring mnemonic, and the keyring only supports storing
        // a singular mnemonic, so import as a private key
        const privateKey = mnemonicPathToPrivateKey(
          blockchain,
          mnemonic as string,
          signedWalletDescriptor.derivationPath
        );

        if (keyringExists) {
          publicKey = await background.request({
            method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
            params: [blockchain, privateKey, name],
          });
        } else {
          // Blockchain keyring doesn't exist, init
          publicKey = await background.request({
            method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
            params: [
              {
                signature: signedWalletDescriptor.signature,
                blockchain,
                publicKey: signedWalletDescriptor.publicKey,
                privateKey,
              },
            ],
          });
        }
      }
    }

    setSelectedPublicKey(publicKey);
    setOpenDrawer(true);
  };

  const steps = [
    // Show the seed phrase if we are creating based on a mnemonic
    ...(inputMnemonic
      ? [
        <MnemonicInput
          key="MnemonicInput"
          buttonLabel="Next"
          onNext={async (mnemonic) => {
              setMnemonic(mnemonic);
              nextStep();
            }}
          />,
          // Must prompt for a name if using an input mnemonic, because we can't
          // easily generate one
        <InputName
          key="InputName"
          onNext={(name) => {
              setName(name);
              nextStep();
            }}
          />,
        ]
      : []),
    <ImportWallets
      key="ImportWallets"
      blockchain={blockchain}
      mnemonic={mnemonic}
      recovery={publicKey}
      allowMultiple={false}
      onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
        // Should only be one wallet descriptor
        const walletDescriptor = walletDescriptors[0];
        const message = getAddMessage(walletDescriptor.publicKey);
        const signature = await signMessageForWallet(
          walletDescriptor.blockchain,
          walletDescriptor.publicKey,
          message,
          {
            mnemonic,
            signedWalletDescriptors: [
              {
                ...walletDescriptor,
                signature: "",
              },
            ],
          }
        );
        await onComplete({
          ...walletDescriptor,
          signature,
        });
      }}
    />,
  ];

  return (
    <>
      {steps[step]}
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(open: boolean) => {
          setOpenDrawer(open);
          if (!open) {
            closeParentDrawer();
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
          publicKey={selectedPublicKey!}
          onClose={() => {
            setOpenDrawer(false);
            closeParentDrawer();
          }}
        />
      </WithMiniDrawer>
    </>
  );
}

function InputName({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "0 16px 0 16px",
      }}
    >
      <Box sx={{ margin: "24px" }}>
        <Header text="Enter a name for the wallet" />
      </Box>

      <Box sx={{ margin: "0 16px" }}>
        <TextInput
          autoFocus
          placeholder="Name"
          value={name}
          setValue={(e: any) => setName(e.target.value)}
        />
      </Box>
      <Box>
        <PrimaryButton
          label="Next"
          onClick={() => onNext(name)}
          style={{ marginBottom: 16 }}
        />
      </Box>
    </Box>
  );
}
