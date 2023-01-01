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

export function useEthereumNftCollections(publicKey: string): Array<any> {
  const connectionUrl = useRecoilValue(atoms.ethereumConnectionUrl);
  return useRecoilValue(
    atoms.ethereumNftCollections({ publicKey, connectionUrl })
  );
}
