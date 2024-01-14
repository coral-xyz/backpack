import { useRecoilCallback } from "recoil";

import * as atoms from "../../atoms";

export const useUpdateEthereumBalances = () =>
  useRecoilCallback(
    ({ set }: any) =>
      async ({
        connectionUrl,
        publicKey,
        balances,
      }: {
        connectionUrl: string;
        publicKey: string;
        balances: any;
      }) => {
        set(
          atoms.ethereumBalances({
            connectionUrl,
            publicKey,
          }),
          new Map(Object.entries(balances))
        );
      }
  );
