import { useCallback, useEffect, useState } from "react";
import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYRING_SET_MNEMONIC } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { CheckIcon, PrimaryButton, TextInput } from "@coral-xyz/react-common";
import {
  secureUserAtom,
  useBackgroundClient,
  useCreateNewWallet,
  userClientAtom,
} from "@coral-xyz/recoil";
import { safeClientResponse } from "@coral-xyz/secure-clients";
import {
  type BlockchainWalletInit,
  BlockchainWalletInitType,
} from "@coral-xyz/secure-clients/types";
import { useTheme } from "@coral-xyz/tamagui";
import { Box, Typography } from "@mui/material";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { useSteps } from "../../../../hooks/useSteps";
import { ImportWallets } from "../../../common/Account/ImportWallets";
import { MnemonicInput } from "../../../common/Account/MnemonicInput";
import { WithMiniDrawer } from "../../../common/Layout/Drawer";

import { ConfirmCreateWallet } from "./";

// WARNING: this will force set the mnemonic. Only use this if no mnemonic
//          exists.
export function ImportMnemonicAutomatic({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const background = useBackgroundClient();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { t } = useTranslation();
  const { createNewWithPhrase } = useCreateNewWallet(blockchain);
  const navigation = useNavigation<any>();

  const close = () => {
    navigation.popToTop();
    navigation.popToTop();
  };

  const onSync = async (mnemonic: string) => {
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_KEYRING_SET_MNEMONIC,
      params: [mnemonic],
    });

    await createNewWithPhrase();
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
  inputMnemonic,
  ledger,
  publicKey,
}: {
  blockchain: Blockchain;
  inputMnemonic: boolean;
  ledger?: boolean;
  publicKey?: string;
  keyringExists?: boolean;
}) {
  const { step, nextStep } = useSteps();
  const [openDrawer, setOpenDrawer] = useState(false);
  const userClient = useRecoilValue(userClientAtom);
  const user = useRecoilValue(secureUserAtom);
  const [mnemonic, setMnemonic] = useState<string | true>(true);
  const [selectedPublicKey, setSelectedPublicKey] = useState<string | null>(
    publicKey ?? null
  );
  const navigation = useNavigation<any>();

  const closeParentDrawer = () => {
    navigation.popToTop();
    navigation.popToTop();
  };

  // TODO replace the left nav button to go to the previous step if step > 0

  const getBlockchainWalletInits = useCallback(
    (walletDescriptors: WalletDescriptor[]): BlockchainWalletInit[] => {
      const blockchainWalletInits: BlockchainWalletInit[] =
        walletDescriptors.map((walletDescriptor: WalletDescriptor) => {
          if (ledger) {
            return {
              type: BlockchainWalletInitType.HARDWARE,
              device: "ledger",
              ...walletDescriptor,
            };
          } else if (mnemonic === true) {
            return {
              type: BlockchainWalletInitType.MNEMONIC,
              ...walletDescriptor,
            };
          } else {
            return {
              type: BlockchainWalletInitType.PRIVATEKEY_DERIVED,
              mnemonic,
              ...walletDescriptor,
            };
          }
        });
      return blockchainWalletInits;
    },
    [ledger, mnemonic]
  );

  const onComplete = async (walletDescriptors: Array<WalletDescriptor>) => {
    try {
      const blockchainWalletInits = getBlockchainWalletInits(walletDescriptors);
      const { wallets } = await safeClientResponse(
        userClient.initWallet({
          uuid: user.user.uuid,
          blockchainWalletInits,
        })
      );

      setSelectedPublicKey(wallets[0].publicKey!);
      setOpenDrawer(true);
    } catch (e) {
      console.error(e);
      closeParentDrawer();
    }
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
