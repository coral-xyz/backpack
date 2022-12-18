import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useSolanaNftCollections({
  publicKey,
  connectionUrl,
}: {
  publicKey: string;
  connectionUrl: string;
}): Array<any> {
  return useRecoilValue(
    atoms.solanaNftCollections({ publicKey, connectionUrl })
  );
}

export function useEthereumNftCollections(): Array<any> {
  return useRecoilValue(atoms.ethereumNftCollections);
}
