import { atomFamily, selectorFamily } from "recoil";

import { solanaTxDowngradableAccountsAtom } from "./solanaTxDowngradableAccountsAtom";
import { solanaTxIsMutableAtom } from "./solanaTxIsMutableAtom";
import { solanaTxPriorityFeeAtom } from "./solanaTxPriorityFeeAtom";
import { TransactionOverrides } from "../_sharedComponents/SolanaTransactionDetails";

export const solanaTxOverridesAtom = atomFamily<
  TransactionOverrides,
  {
    tx: string;
    publicKey: string;
    disableFeeInjection?: boolean;
  }
>({
  key: "solanaTxPriorityFeeAtom",
  default: (request) => solanaTxOverridesDefaultAtom(request),
});

const solanaTxOverridesDefaultAtom = selectorFamily<
  TransactionOverrides,
  {
    tx: string;
    publicKey: string;
    disableFeeInjection?: boolean;
  }
>({
  key: "solanaTxPriorityFeeAtom",
  get:
    (request) =>
    async ({ get }) => {
      // const solanaTxIsMutable = get(solanaTxIsMutableAtom(request));
      // const priorityFees = get(solanaTxPriorityFeeAtom(request));
      // const solanaTxDowngradableAccounts = get(
      //   solanaTxDowngradableAccountsAtom(request)
      // );

      return {
        computeUnits: "", //priorityFees?.computeUnits?.toString() ?? "",
        priorityFee: "", //priorityFees?.priorityFee?.toString() ?? "",
        downgradedWritableAccounts: [], //solanaTxDowngradableAccounts,
        disableFeeConfig: true, //!solanaTxIsMutable,
        disableDowngradeAccounts: true, // !user.preferences.developerMode || !solanaTxIsMutable,
      };
    },
});
