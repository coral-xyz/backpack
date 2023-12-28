import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEnabledBlockchains,
  userClientAtom,
} from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { PrivateKeyInput } from "../../../common/Account/PrivateKeyInput";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

import { ConfirmCreateWallet } from ".";

export function ImportSecretKey({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey?: string;
}) {
  const background = useBackgroundClient();
  const nav = useNavigation();
  const theme = useTheme();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringExists = enabledBlockchains.includes(blockchain);
  const { close: closeParentDrawer } = useDrawerContext();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [nav, theme]);

  const onNext = async ({
    blockchain,
    privateKey,
    publicKey,
    name,
  }: {
    blockchain: Blockchain;
    privateKey: string;
    publicKey: string;
    name: string;
  }) => {
    try {
      if (keyringExists) {
        // ph101pp todo
        publicKey = await background.request({
          method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
          params: [blockchain, privateKey, name],
        });
      } else {
        // ph101pp todo
        publicKey = await background.request({
          method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
          params: [{ blockchain, publicKey, privateKey }],
        });
      }
      setNewPublicKey(publicKey);
      setOpenDrawer(true);
    } catch (e) {
      console.error(e);
      closeParentDrawer();
    }
  };

  let serverPublicKeys = publicKey ? [{ blockchain, publicKey }] : undefined;

  return (
    <>
      <PrivateKeyInput
        blockchain={blockchain}
        onNext={onNext}
        serverPublicKeys={serverPublicKeys}
      />
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={(open: boolean) => {
          setOpenDrawer(open);
          if (!open) {
            closeParentDrawer();
          }
        }}
      >
        {newPublicKey ? (
          <ConfirmCreateWallet
            blockchain={blockchain}
            publicKey={newPublicKey}
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
