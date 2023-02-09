import { useEffect, useState } from "react";
import { mnemonicPathToPrivateKey } from "@coral-xyz/blockchain-common";
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
} from "@coral-xyz/common";
import { PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Box, Grid } from "@mui/material";

import { useSignMessageForWallet } from "../../../../hooks/useSignMessageForWallet";
import { useSteps } from "../../../../hooks/useSteps";
import { Header } from "../../../common";
import { ImportWallets } from "../../../common/Account/ImportWallets";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import { ActionCard } from "../../../common/Layout/ActionCard";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

import { ConfirmCreateWallet } from "./";

export function ImportMnemonic({
  blockchain,
  keyringExists,
  hasMnemonic,
}: {
  blockchain: Blockchain;
  keyringExists: boolean;
  hasMnemonic: boolean;
}) {
  const nav = useNavigation();
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const { step, nextStep } = useSteps();
  const { close: closeParentDrawer } = useDrawerContext();

  // Can only init a new blockchain keyring if there is a mnemonic
  const allowOwnPhrase = hasMnemonic;
  // Can only do imports via secret key if there is no existing mnemonic on the keyring
  const allowOtherPhrase = keyringExists;

  const [openDrawer, setOpenDrawer] = useState(false);
  // Whether the user is inputting another mnemonic or using the one on the keyring
  // If other phrases are possible, then this is `true` by default, if own phrase
  // is also possible the SetInputMnemonic component will override with the
  // users choice
  const [inputMnemonic, setInputMnemonic] = useState(allowOtherPhrase);
  const [mnemonic, setMnemonic] = useState<string | true>(true);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const signMessageForWallet = useSignMessageForWallet(mnemonic);

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [theme]);

  // TODO replace the left nav button to go to the previous step if step > 0

  const onComplete = async (signedWalletDescriptor: SignedWalletDescriptor) => {
    let publicKey: string;
    if (!inputMnemonic) {
      if (keyringExists) {
        // Using the keyring mnemonic and the blockchain keyring exists, just
        // import the path
        publicKey = await background.request({
          method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
          params: [blockchain, signedWalletDescriptor],
        });
      } else {
        // Blockchain keyring doesn't exist, init
        publicKey = await background.request({
          method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
          params: [blockchain, signedWalletDescriptor],
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
      publicKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
        params: [blockchain, privateKey, name],
      });
    }
    setPublicKey(publicKey);
    setOpenDrawer(true);
  };

  const steps = [
    ...(allowOwnPhrase && allowOtherPhrase
      ? // Only show the the own/other phrase option if they are actually options
        [
          <SetInputMnemonic
            onNext={(inputMnemonic) => {
              setInputMnemonic(inputMnemonic);
              nextStep();
            }}
          />,
        ]
      : []),
    // Show the seed phrase if we are creating based on a mnemonic
    ...(inputMnemonic
      ? [
          <MnemonicInput
            buttonLabel="Next"
            onNext={(mnemonic) => {
              setMnemonic(mnemonic);
              nextStep();
            }}
          />,
          // Must prompt for a name if using an input mnemonic, because we can't
          // easily generate one
          <InputName
            onNext={(name) => {
              setName(name);
              nextStep();
            }}
          />,
        ]
      : []),
    <ImportWallets
      blockchain={blockchain!}
      mnemonic={mnemonic}
      allowMultiple={false}
      onNext={async (walletDescriptors: Array<WalletDescriptor>) => {
        // Should only be one wallet descriptor
        const walletDescriptor = walletDescriptors[0];
        const message = getAddMessage(walletDescriptor.publicKey);
        const signature = await signMessageForWallet(walletDescriptor, message);
        onComplete({
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
          publicKey={publicKey!}
          onClose={() => {
            setOpenDrawer(false);
            closeParentDrawer();
          }}
        />
      </WithMiniDrawer>
    </>
  );
}

export function SetInputMnemonic({
  onNext,
}: {
  onNext: (mnemonicInput: boolean) => void;
}) {
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
          <Header text="Import using a secret recovery phrase" />
        </Box>

        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ActionCard
                text="Your secret recovery phrase"
                subtext="Use the secret recovery phrase from your Backpack account."
                onClick={() => onNext(false)}
              />
            </Grid>
            <Grid item xs={12}>
              <ActionCard
                text="Other secret recovery phrase"
                subtext="Enter a new secret recovery phrase for a one time import."
                onClick={() => onNext(true)}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  );
}

export function InputName({ onNext }: { onNext: (name: string) => void }) {
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
          autoFocus={true}
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
