import { useEffect, useState } from "react";
import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYRING_SET_MNEMONIC } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  ImportedIcon,
  MnemonicIcon,
  PushDetail,
} from "@coral-xyz/react-common";
import { useBackgroundClient, useCreateNewWallet } from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

import { ConfirmCreateWallet } from "./";

export function CreateOrImportMnemonic({
  blockchain,
  keyringExists,
}: {
  blockchain: Blockchain;
  keyringExists: boolean;
}) {
  const nav = useNavigation();
  const menuItems = {
    "Generate new phrase": {
      onClick: () =>
        nav.push("create-mnemonic", {
          blockchain,
          keyringExists,
        }),
      icon: (props: any) => <MnemonicIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Import recovery phrase": {
      onClick: () =>
        nav.push("set-and-sync-mnemonic", {
          blockchain,
          keyringExists,
        }),
      icon: (props: any) => <ImportedIcon {...props} />,
      detailIcon: <PushDetail />,
    },
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        style={{
          padding: "0 16px 0 16px",
        }}
      >
        <Box style={{ margin: 8 }}>
          <Header
            text="Set your Backpack secret recovery phrase"
            style={{
              fontWeight: 500,
            }}
          />
          <SubtextParagraph>
            Create or import a secret recovery phrase. This will be used to
            create new wallets, so make sure you don't lose it. Only you will
            have access to this secret.
          </SubtextParagraph>
        </Box>
      </Box>
      <SettingsList menuItems={menuItems} />
    </Box>
  );
}

export function CreateMnemonic({
  blockchain,
}: // keyringExists,
{
  blockchain: Blockchain;
  keyringExists: boolean;
}) {
  const nav = useNavigation();
  const theme = useTheme();
  const background = useBackgroundClient();
  const { close: closeParentDrawer } = useDrawerContext();
  const { t } = useTranslation();
  const { createNewWithPhrase } = useCreateNewWallet(blockchain);

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
    mnemonic: string
    // signedWalletDescriptor: WalletDescriptor
  ) => {
    try {
      // let publicKey: string;
      // ph101pp todo
      await background.request({
        method: UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
        params: [mnemonic],
      });
      const { publicKey } = await createNewWithPhrase();
      setPublicKey(publicKey);
      setOpenDrawer(true);
    } catch (e) {
      console.error(e);
      closeParentDrawer();
    }
  };

  return (
    <>
      <MnemonicInput
        readOnly
        buttonLabel={t("next")}
        subtitle="Write it down and store it in a safe place."
        onNext={async (mnemonic: string) => {
          // ph101pp todo
          await onComplete(mnemonic);
          // const walletDescriptor = await background.request({
          //   method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
          //   params: [blockchain, 0, mnemonic],
          // });
          // await onComplete(mnemonic, {
          //   ...walletDescriptor,
          // });
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
