import { useState } from "react";
import { useCustomTheme } from "@coral-xyz/themes";
import { AddConnectWalletMenu } from "./AddConnectWalletMenu";
import { ImportSecretKey } from "../../Settings";
import { WithDrawer } from "../../Layout/Drawer";
import { WithNav, NavBackButton } from "../../Layout/Nav";
import {
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

export type AddConnectFlows = "create-new-wallet" | "import-wallet" | null;

export function AddConnectWallet({
  onAddSuccess,
  close,
}: {
  onAddSuccess: (publicKey?: string) => void;
  close: () => void;
}) {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const [addConnectFlow, setAddConnectFlow] = useState<AddConnectFlows>(null);
  const [step, setStep] = useState(0);

  // const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (addConnectFlow === null) {
      // If we are at the first step, close
      close();
    } else if (step === 0) {
      // First step in one of the wallet flows, go back to the add connect menu
      setAddConnectFlow(null);
    } else {
      // Previous step in flow
      setStep(step - 1);
    }
  };

  //
  // Add a new pubkey based on an existing mnemonic. Note that this is different
  // to the create wallet flow in the onboarding welcome, which imports the first
  // account from a randomly generated mnemonic.
  //
  const createNewWallet = async () => {
    const newPubkey = await background.request({
      method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
      params: [],
    });

    await background.request({
      method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
      params: [newPubkey],
    });
  };

  const secretKeyImport = async (
    secretKey: string,
    name: string
  ): Promise<string> => {
    return background.request({
      method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
      params: [secretKey, name],
    });
  };

  const onSelectAction = (action: AddConnectFlows) => {
    if (action === "create-new-wallet") {
      createNewWallet()
        .then(() => onAddSuccess())
        .catch(console.error);
    } else {
      setAddConnectFlow(action);
    }
  };

  //
  // Flow for importing an existing mnemonic. The user can input a 12 or
  // 24 word mnemonic and select the accounts they want to import, as well
  // as set a password.
  //
  const importWalletFlow = [
    <ImportSecretKey
      onNext={async (secretKey: string, name: string) => {
        const publicKey = await secretKeyImport(secretKey, name);
        onAddSuccess(publicKey);
      }}
    />,
  ];

  let renderComponent;
  if (addConnectFlow === null || addConnectFlow === "create-new-wallet") {
    renderComponent = (
      <AddConnectWalletMenu onSelect={(action) => onSelectAction(action)} />
    );
  } else {
    renderComponent = importWalletFlow[step] || null;
  }

  return (
    <WithDrawer
      openDrawer={true}
      setOpenDrawer={(open: boolean) => {
        if (!open) close();
      }}
    >
      <WithNav
        navButtonLeft={<NavBackButton onClick={prevStep} />}
        navbarStyle={{
          backgroundColor: theme.custom.colors.nav,
        }}
        navContentStyle={{
          backgroundColor: theme.custom.colors.nav,
          height: "100%",
        }}
      >
        {renderComponent}
      </WithNav>
    </WithDrawer>
  );
}
