import { Blockchain, type DerivationPath } from "@coral-xyz/common";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ImportAccounts as ImportAccounts_,
  type SelectedAccount,
} from "../../common/Account/ImportAccounts";

export const ImportAccounts = () => {
  const { pathname } = useLocation();
  const { mnemonic } = useParams();
  const navigate = useNavigate();
  return (
    <div>
      <ImportAccounts_
        blockchain={Blockchain.SOLANA}
        mnemonic={mnemonic}
        onNext={(
          accounts: SelectedAccount[],
          derivationPath: DerivationPath
        ) => {
          navigate(
            `${pathname}/${JSON.stringify({
              accounts: accounts.map((a) => a.index),
              derivationPath,
            })}`
          );
        }}
      />
    </div>
  );
};
