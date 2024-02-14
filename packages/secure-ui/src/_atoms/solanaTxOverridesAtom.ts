import { secureUserAtom } from "@coral-xyz/recoil";
import { atomFamily, selectorFamily, waitForAll } from "recoil";

import { solanaTxDowngradableAccountsAtom } from "./solanaTxDowngradableAccountsAtom";
import { solanaTxIsMutableAtom } from "./solanaTxIsMutableAtom";
import { solanaTxPriorityFeeAtom } from "./solanaTxPriorityFeeAtom";
import { TransactionOverrides } from "../_types/SolanaTransactionOverrides";

export const solanaAllTxOverridesAtom = atomFamily<
  TransactionOverrides[],
  {
    publicKey: string;
    txs: string[];
    disableTxMutation?: boolean;
  }
>({
  key: "solanaTxPriorityFeeAtom",
  default: (request) => solanaAllTxOverridesDefaultAtom(request),
});

export const solanaTxOverridesAtom = atomFamily<
  TransactionOverrides,
  {
    tx: string;
    publicKey: string;
    disableTxMutation?: boolean;
  }
>({
  key: "solanaTxPriorityFeeAtom",
  default: (request) => solanaTxOverridesDefaultAtom(request),
});

const solanaAllTxOverridesDefaultAtom = selectorFamily<
  TransactionOverrides[],
  {
    txs: string[];
    publicKey: string;
    disableTxMutation?: boolean;
  }
>({
  key: "solanaAllTxOverridesDefaultAtom",
  get:
    (request) =>
    async ({ get }) => {
      return get(
        waitForAll(
          request.txs.map((tx) =>
            solanaTxOverridesDefaultAtom({ ...request, tx })
          )
        )
      );
    },
});

const solanaTxOverridesDefaultAtom = selectorFamily<
  TransactionOverrides,
  {
    tx: string;
    publicKey: string;
    disableTxMutation?: boolean;
  }
>({
  key: "solanaTxOverridesDefaultAtom",
  get:
    (request) =>
    async ({ get }) => {
      // const user = get(secureUserAtom);
      const solanaTxIsMutable = get(solanaTxIsMutableAtom(request));
      const priorityFees = get(solanaTxPriorityFeeAtom(request));
      // const solanaTxDowngradableAccounts = get(
      //   solanaTxDowngradableAccountsAtom(request)
      // );
      return {
        computeUnits: priorityFees?.computeUnits?.toString() ?? "",
        priorityFee: priorityFees?.priorityFee?.toString() ?? "",
        downgradedWritableAccounts: [], //solanaTxDowngradableAccounts,
        disableFeeConfig: !solanaTxIsMutable,
        // to enable, add commented out UI as well.
        disableDowngradeAccounts: true, // !user.preferences.developerMode || !solanaTxIsMutable,
      };
    },
});
