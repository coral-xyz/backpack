import { useEffect, useState } from "react";
import type { Blockchain, SignedWalletDescriptor } from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
  UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
} from "@coral-xyz/common";
import { useBackgroundClient, useRpcRequests } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

import { ConfirmCreateWallet } from "./";

export function CreateMnemonic({
  blockchain,
  keyringExists,
}: {
  blockchain: Blockchain;
  keyringExists: boolean;
}) {
  const nav = useNavigation();
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const { close: closeParentDrawer } = useDrawerContext();
  const { signMessageForWallet } = useRpcRequests();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [nav, theme]);

  // TODO replace the left nav button to go to the previous step if step > 0

  const onComplete = async (
    mnemonic: string,
    signedWalletDescriptor: SignedWalletDescriptor
  ) => {
    let publicKey: string;
    await background.request({
      method: UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
      params: [mnemonic],
    });
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
          { mnemonic, signedWalletDescriptors: [signedWalletDescriptor] },
        ],
      });
    }
    setPublicKey(publicKey);
    setOpenDrawer(true);
  };

  return (
    <>
      <MnemonicInput
        readOnly
        buttonLabel="Next"
        subtitle="Write it down and store it in a safe place."
        onNext={async (mnemonic: string) => {
          const walletDescriptor = await background.request({
            method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
            params: [blockchain, 0, mnemonic],
          });
          const signature = await signMessageForWallet(
            blockchain,
            walletDescriptor.publicKey,
            getAddMessage(walletDescriptor.publicKey),
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
          await onComplete(mnemonic, {
            ...walletDescriptor,
            signature,
          });
        }}
      />
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(open: boolean) => {
          // Must close parent when the confirm create wallet drawer closes because
          // the next button in the mnemonic input screen is no longer valid as the users
          // keyring has a mnemonic once it has been clicked once
          if (!open) closeParentDrawer();
          setOpenDrawer(open);
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
