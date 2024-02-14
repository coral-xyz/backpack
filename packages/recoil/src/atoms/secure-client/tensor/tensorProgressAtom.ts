import { Blockchain } from "@coral-xyz/common";
import { TensorClient } from "@coral-xyz/secure-clients";
import type { TensorMintDataType } from "@coral-xyz/secure-clients/types";
import { atomFamily, DefaultValue } from "recoil";

export type TensorProgressAtomType = {
  execute?: (setter: {
    setProgress: (progress: string) => void;
    setError: (error: string) => void;
    setSignature: (signature: string) => void;
    setDone: () => void;
  }) => () => void;
  executing: boolean;
  isDone?: boolean;
  cancel?: () => void;
  progress?: string;
  signature?: string;
  error?: string;
};

export const tensorProgressAtom = atomFamily<TensorProgressAtomType, string>({
  key: "transactionProgressAtom",
  default: { executing: false },
  effects: (key: string) => [
    ({ setSelf, onSet }) => {
      onSet((newValue, oldValue) => {
        if (!newValue.executing) {
          if (!newValue.execute) {
            throw new Error("TransactionProgress requires execute method");
          }

          const cancel = newValue.execute({
            setProgress: (progress) => {
              setSelf((prev) =>
                prev instanceof DefaultValue ? prev : { ...prev, progress }
              );
            },
            setError: (error) => {
              setSelf((prev) =>
                prev instanceof DefaultValue
                  ? prev
                  : { ...prev, error, progress: "error" }
              );
            },
            setSignature: (signature) => {
              setSelf((prev) =>
                prev instanceof DefaultValue ? prev : { ...prev, signature }
              );
            },
            setDone: () => {
              setSelf((prev) =>
                prev instanceof DefaultValue ? prev : { ...prev, isDone: true }
              );
            },
          });

          setSelf((prev) =>
            prev instanceof DefaultValue ? prev : { ...prev, cancel }
          );
        }
      });
    },
  ],
  dangerouslyAllowMutability: true,
});
