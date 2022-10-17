import {
  Blockchain,
  DerivationPath,
  UI_RPC_METHOD_LEDGER_IMPORT,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { OptionsContainer } from "../../../../Onboarding";
import { SelectedAccount } from "../../../../common/Account/ImportAccounts";
import { ConnectHardware } from "../ConnectHardware";

//
// This is a wrapper method around the ConnectHardware flow that provides
// a function to import accounts and derivation paths into the keyring store
// to the onImport prop.
//
export function ConnectHardwareImport({
  blockchain,
  onComplete,
}: {
  blockchain: Blockchain;
  onComplete: () => void;
}) {
  const background = useBackgroundClient();

  //
  // Add one or more pubkeys to the Ledger store.
  //
  const ledgerImport = async (
    accounts: SelectedAccount[],
    derivationPath: DerivationPath
  ) => {
    for (const account of accounts) {
      await background.request({
        method: UI_RPC_METHOD_LEDGER_IMPORT,
        params: [
          blockchain,
          derivationPath,
          account.index,
          account.publicKey.toString(),
        ],
      });
    }

    //
    // Automatically switch to the first wallet in the import list.
    //
    if (accounts.length > 0) {
      const active = accounts[0].publicKey.toString();
      await background.request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [active, blockchain],
      });
    }
  };

  return (
    <OptionsContainer>
      <ConnectHardware
        blockchain={blockchain}
        onImport={ledgerImport}
        onComplete={onComplete}
      />
    </OptionsContainer>
  );
}
