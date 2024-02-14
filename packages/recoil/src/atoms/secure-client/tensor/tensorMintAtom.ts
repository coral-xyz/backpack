import { Blockchain } from "@coral-xyz/common";
import { TensorClient } from "@coral-xyz/secure-clients";
import type { TensorMintDataType } from "@coral-xyz/secure-clients/types";
import { atomFamily, DefaultValue } from "recoil";

export type TensorMintAtomType = {
  status: "loading" | "error" | "ok";
  data: TensorMintDataType | null;
};
export const tensorMintAtom = atomFamily<
  TensorMintAtomType,
  {
    mint: string | undefined;
    intervalMs?: number;
    blockchain: Blockchain;
    owner?: string;
  }
>({
  key: "tensorMintAtom",
  effects: ({ mint, intervalMs, blockchain, owner }) => [
    ({ setSelf, onSet }) => {
      const tensorClient = new TensorClient();
      let fetching = false;
      const refetch = async () => {
        if (!mint || !owner || blockchain !== Blockchain.SOLANA) {
          setSelf((prev) => ({
            data: prev instanceof DefaultValue ? null : prev.data,
            status: "error",
          }));
          return;
        }
        fetching = true;
        return tensorClient
          .fetchTensorMintData({ mint, owner })
          .then((data) => setSelf({ status: "ok", data }))
          .catch((e) => {
            console.error(e);
            setSelf((prev) => ({
              data: prev instanceof DefaultValue ? null : prev.data,
              status: "error",
            }));
          })
          .then(() => {
            fetching = false;
          });
      };

      setSelf({ status: "loading", data: null });
      refetch().catch((e) => {
        setSelf((prev) => ({
          data: prev instanceof DefaultValue ? null : prev.data,
          status: "error",
        }));
        console.error(e);
      });

      onSet(() => {
        if (!fetching) {
          refetch().catch((e) => {
            setSelf((prev) => ({
              data: prev instanceof DefaultValue ? null : prev.data,
              status: "error",
            }));
            console.error(e);
          });
        }
      });
    },
  ],
});
