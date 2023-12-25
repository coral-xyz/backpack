import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
} from "@coral-xyz/common";
import {
  secureUserAtom,
  useBackgroundClient,
  useEnabledBlockchains,
  user,
  userClientAtom,
} from "@coral-xyz/recoil";
import { BlockchainWalletType } from "@coral-xyz/secure-background/types";
import { safeClientResponse } from "@coral-xyz/secure-clients";
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
  const nav = useNavigation();
  const userClient = useRecoilValue(userClientAtom);
  const user = useRecoilValue(secureUserAtom);
  const theme = useTheme();
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
      const { wallets } = await safeClientResponse(
        userClient.initWallet({
          uuid: user.user.uuid,
          blockchainWalletInits: [
            {
              type: BlockchainWalletType.PRIVATEKEY,
              blockchain,
              privateKey,
              publicKey,
              name,
            },
          ],
        })
      );

      setNewPublicKey(wallets[0].publicKey);
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
