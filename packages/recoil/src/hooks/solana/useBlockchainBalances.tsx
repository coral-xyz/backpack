import { useRecoilValue } from "recoil";
import * as atoms from "../../atoms";

export function useSolanaNftCollections(): Array<any> {
  return useRecoilValue(atoms.solanaNftCollections);
}

export function useEthereumNftCollections(): Array<any> {
  return useRecoilValue(atoms.ethereumNftCollections);
}
