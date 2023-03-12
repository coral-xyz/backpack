import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";

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
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");
  const { close: closeParentDrawer } = useDrawerContext();

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
    name,
  }: {
    blockchain: Blockchain;
    privateKey: string;
    name: string;
  }) => {
    const newPublicKey = await background.request({
      method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
      params: [blockchain, privateKey, name],
    });
    setNewPublicKey(newPublicKey);
    setOpenDrawer(true);
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
        />
      </WithMiniDrawer>
    </>
  );
}
