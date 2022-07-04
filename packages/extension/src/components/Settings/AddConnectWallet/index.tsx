import { useState } from "react";
import Transport from "@ledgerhq/hw-transport";
import { useCustomTheme } from "@coral-xyz/themes";
import { AddConnectWalletMenu } from "./AddConnectWalletMenu";
import { ImportAccounts } from "../../Account/ImportAccounts";
import type { SelectedAccount } from "../../Account/ImportAccounts";
import { ImportSecretKey } from "../../Settings";
import { ConnectHardware } from "../../Settings/ConnectHardware";
import { ConnectHardwareSearching } from "../../Settings/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareSuccess } from "../../Settings/ConnectHardware/ConnectHardwareSuccess";
import { WithDrawer } from "../../Layout/Drawer";
import { WithNav, NavBackButton } from "../../Layout/Nav";
import {
  DerivationPath,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_LEDGER_IMPORT,
  UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

export type AddConnectFlows =
  | "create-new-wallet"
  | "import-wallet"
  | "connect-hardware"
  | null;

export function AddConnectWallet({
  onAddSuccess,
  close,
}: {
  onAddSuccess: () => void;
  close: () => void;
}) {
  const theme = useCustomTheme();
  const background = useBackgroundClient();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [addConnectFlow, setAddConnectFlow] = useState<AddConnectFlows>(null);
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(step + 1);
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

  //
  // Add a pubkey to the Ledger store.
  //
  const ledgerImport = async (
    accounts: SelectedAccount[],
    derivationPath: DerivationPath
  ) => {
    for (const account of accounts) {
      await background.request({
        method: UI_RPC_METHOD_LEDGER_IMPORT,
        params: [derivationPath, account.index, account.publicKey.toString()],
      });
    }
  };

  const secretKeyImport = async (secretKey: string, name: string) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
      params: [secretKey, name],
    });
  };

  const onSelectAction = (action: AddConnectFlows) => {
    if (action === "create-new-wallet") {
      createNewWallet().then(onAddSuccess).catch(console.error);
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
        await secretKeyImport(secretKey, name);
        onAddSuccess();
      }}
    />,
  ];

  //
  // Flow for importing a hardware wallet.
  //
  const connectHardwareFlow = [
    <ConnectHardware onNext={() => nextStep()} />,
    <ConnectHardwareSearching
      onNext={(transport) => {
        setTransport(transport);
        nextStep();
      }}
      isConnectFailure={!!transportError}
    />,
    <ImportAccounts
      transport={transport}
      onNext={async (
        accounts: SelectedAccount[],
        derivationPath: DerivationPath
      ) => {
        await ledgerImport(accounts, derivationPath);
        nextStep();
      }}
      onError={() => {
        setTransportError(true);
        prevStep();
      }}
    />,
    <ConnectHardwareSuccess onNext={onAddSuccess} />,
  ];

  let renderComponent;
  if (addConnectFlow === null || addConnectFlow === "create-new-wallet") {
    renderComponent = (
      <AddConnectWalletMenu onSelect={(action) => onSelectAction(action)} />
    );
  } else {
    const flow = {
      "import-wallet": importWalletFlow,
      "connect-hardware": connectHardwareFlow,
    }[addConnectFlow];
    renderComponent = flow[step] || null;
  }

  return (
    <WithDrawer openDrawer={true}>
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
