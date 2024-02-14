import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { secureUserAtom, userClientAtom } from "@coral-xyz/recoil";
import { BlockchainWalletInitType } from "@coral-xyz/secure-background/types";
import { safeClientResponse } from "@coral-xyz/secure-clients";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { PrivateKeyInput } from "../../../common/Account/PrivateKeyInput";
import { WithMiniDrawer } from "../../../common/Layout/Drawer";

import { ConfirmCreateWallet } from ".";

export function ImportSecretKey({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey?: string;
}) {
  const userClient = useRecoilValue(userClientAtom);
  const user = useRecoilValue(secureUserAtom);
  const navigation = useNavigation<any>();

  const closeParentDrawer = () => {
    navigation.popToTop();
    navigation.popToTop();
  };

  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");

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
              type: BlockchainWalletInitType.PRIVATEKEY,
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
        fullscreen={false}
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
