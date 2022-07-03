import { useState } from "react";
import Transport from "@ledgerhq/hw-transport";
import { AddConnectWalletMenu } from "./AddConnectWalletMenu";
import { ImportAccounts } from "../../Account/ImportAccounts";
import type { SelectedAccount } from "../../Account/ImportAccounts";
import { ConnectHardware } from "../../Settings/ConnectHardware";
import { ConnectHardwareSearching } from "../../Settings/ConnectHardware/ConnectHardwareSearching";
import { ConnectHardwareSuccess } from "../../Settings/ConnectHardware/ConnectHardwareSuccess";

import {
  getBackgroundClient,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "@coral-xyz/common";

export type AddConnectFlows =
  | "create-new-wallet"
  | "import-wallet"
  | "connect-hardware"
  | null;

export function AddConnectWallet({ closeDrawer }: { closeDrawer: () => void }) {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [transportError, setTransportError] = useState(false);
  const [addConnectFlow, setAddConnectFlow] = useState<AddConnectFlows>(null);
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step === 0) {
      // If we are at the first step, back should revert to settings menu
      closeDrawer();
    } else {
      setStep(step - 1);
    }
  };

  //
  // Add a new pubkey based on an existing mnemonic. Note that this is different
  // to the create wallet flow in the onboarding welcome, which imports the first
  // account from a randomly generated mnemonic.
  //
  const createNewWallet = async () => {
    const background = getBackgroundClient();
    const newPubkeyStr = await background.request({
      method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
      params: [],
    });

    await background.request({
      method: UI_RPC_METHOD_WALLET_DATA_ACTIVE_WALLET_UPDATE,
      params: [newPubkeyStr],
    });
  };

  const ledgerImport = async (
    accounts: SelectedAccount[],
    derivationPath: DerivationPath
  ) => {
    const background = getBackgroundClient();
    for (const account of accounts) {
      await background.request({
        method: UI_RPC_METHOD_LEDGER_IMPORT,
        params: [derivationPath, account.index, account.publicKey.toString()],
      });
    }
  };

  const onSelectAction = (action: AddConnectFlows) => {
    if (action === "create-new-wallet") {
      createNewWallet()
        .then(() => closeDrawer())
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
  const importWalletFlow = [<ConnectHardware onNext={() => nextStep()} />];

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
    <ConnectHardwareSuccess onNext={closeDrawer} />,
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

  return renderComponent;
}
