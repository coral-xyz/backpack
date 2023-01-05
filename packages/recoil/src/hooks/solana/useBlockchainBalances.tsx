import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export function useEthereumNftCollections(publicKey: string): Array<any> {
  const connectionUrl = useRecoilValue(atoms.ethereumConnectionUrl);
  return useRecoilValue(
    atoms.ethereumNftCollections({ publicKey, connectionUrl })
  );
}
