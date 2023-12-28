import { useEffect, useState } from "react";
import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
  UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { CheckIcon, PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useBackgroundClient, userClientAtom } from "@coral-xyz/recoil";
import { mnemonicPathToPrivateKey } from "@coral-xyz/secure-background/legacyExport";
import { useTheme } from "@coral-xyz/tamagui";
import { Box, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

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
  const [openDrawer, setOpenDrawer] = useState(false);
  const { close } = useDrawerContext();
  const { t } = useTranslation();

  const onSync = async (mnemonic: string) => {
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
      params: [mnemonic],
    });
  };

  return (
    <>
      <MnemonicInput
        key="MnemonicInput"
        buttonLabel={t("import")}
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
  const theme = useTheme();
  return (
    <div
      style={{
        height: "232px",
        backgroundColor: theme.baseBackgroundL2.val,
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
            color: theme.baseTextHighEmphasis.val,
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
  ledger,
  publicKey,
}: {
  blockchain: Blockchain;
  keyringExists: boolean;
  inputMnemonic: boolean;
  forceSetMnemonic: boolean;
  ledger?: true;
  publicKey?: string;
}) {
  const nav = useNavigation();
  const theme = useTheme();
  const background = useBackgroundClient();
  const { step, nextStep } = useSteps();
  const { close: closeParentDrawer } = useDrawerContext();
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

  const onComplete = async (walletDescriptors: Array<WalletDescriptor>) => {
    try {
      let publicKey: string;
      //
      // Note: this loop is inefficient. If the UI ends up being too slow then
      //       batch this into a new import api that takes in all the wallet
      //       descriptors at once.
      //
      const blockchainsImported = new Map();
      for (let k = 0; k < walletDescriptors.length; k += 1) {
        const walletDescriptor = walletDescriptors[k];
        const hasImported = blockchainsImported.get(
          walletDescriptor.blockchain
        );
        publicKey = await _onComplete(
          walletDescriptor,
          // If previously imported on a blockchain, the keyring exists.
          hasImported ? true : keyringExists
        );

        blockchainsImported.set(walletDescriptor.blockchain, true);
      }
      setSelectedPublicKey(publicKey!);
      setOpenDrawer(true);
    } catch (e) {
      console.error(e);
      closeParentDrawer();
    }
  };
  const _onComplete = async (
    signedWalletDescriptor: WalletDescriptor,
    keyringExists: boolean
  ) => {
    let publicKey: string;

    if (forceSetMnemonic) {
      // ph101pp todo
      await background.request({
        method: UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
        params: [mnemonic],
      });
      // ph101pp todo
      publicKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
        params: [signedWalletDescriptor],
      });
    } else {
      if (ledger) {
        if (keyringExists) {
          // Just import the wallet because the keyring already exists
          // ph101pp todo
          publicKey = await background.request({
            method: UI_RPC_METHOD_LEDGER_IMPORT,
            params: [signedWalletDescriptor],
          });
        } else {
          // ph101pp todo
          publicKey = await background.request({
            method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
            params: [{ signedWalletDescriptors: [signedWalletDescriptor] }],
          });
        }
      } else if (!inputMnemonic) {
        if (keyringExists) {
          // Using the keyring mnemonic and the blockchain keyring exists, just
          // import the path
          // ph101pp todo
          publicKey = await background.request({
            method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
            params: [signedWalletDescriptor],
          });
        } else {
          // ph101pp todo
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
          // ph101pp todo
          publicKey = await background.request({
            method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
            params: [blockchain, privateKey, name],
          });
        } else {
          // Blockchain keyring doesn't exist, init
          // ph101pp todo
          publicKey = await background.request({
            method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
            params: [
              {
                blockchain,
                publicKey: signedWalletDescriptor.publicKey,
                privateKey,
              },
            ],
          });
        }
      }
    }
    return publicKey;
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
        ]
      : []),
    <ImportWallets
      key="ImportWallets"
      blockchain={blockchain}
      mnemonic={ledger ? undefined : mnemonic}
      recovery={publicKey}
      allowMultiple
      onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
        await onComplete(walletDescriptors);
      }}
      autoSelect
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
      >
        {selectedPublicKey ? (
          <ConfirmCreateWallet
            blockchain={blockchain}
            publicKey={selectedPublicKey!}
            onClose={() => {
              setOpenDrawer(false);
              closeParentDrawer();
            }}
          />
        ) : null}
      </WithMiniDrawer>
    </>
  );
}
