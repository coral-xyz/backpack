import { useTranslation } from "@coral-xyz/i18n";
import { TensorClient } from "@coral-xyz/secure-clients";
import type {
  TensorActions,
  TensorMintDataType,
} from "@coral-xyz/secure-clients/types";
import { PublicKey } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import type { TensorProgressAtomType } from "./tensorProgressAtom";
import { solanaClientAtom } from "../blockchainClientAtoms";

export const useCreateTensorAction = () => {
  const { t } = useTranslation();
  const solanaClient = useRecoilValue(solanaClientAtom);

  return ({
      action,
      publicKey,
      compressed,
      mint,
      price,
      tensorMintData,
      onDone,
    }: {
      action: TensorActions;
      publicKey: string;
      compressed: boolean;
      mint: string;
      price: string;
      tensorMintData: TensorMintDataType;
      onDone: () => void;
    }): TensorProgressAtomType["execute"] =>
    ({ setProgress, setError, setSignature, setDone }) => {
      let cancelled = false;
      void (async () => {
        try {
          const tensorClient = new TensorClient();
          const tx = await tensorClient.createTensorTx({
            action,
            publicKey,
            compressed,
            mint,
            price,
            tensorMintData,
          });

          if (cancelled) {
            return;
          }
          const sig = await solanaClient.wallet.send({
            publicKey: new PublicKey(publicKey),
            tx,
          });

          setProgress("confirming");
          setSignature(sig);
          await solanaClient.wallet.confirmTransaction(sig);
          try {
            setProgress("done");
            setDone();
            onDone();
          } catch {
            // drawer might be closed/ unmounted
          }
        } catch (e) {
          const error = e as Error;
          if (error?.message) {
            setError(error.message);
          } else {
            setError(t("failed"));
          }
        }
      })();

      return () => {
        cancelled = true;
        setDone();
      };
    };
};
