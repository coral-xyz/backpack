import { useRecoilValue } from "recoil";
import * as atoms from "../recoil/atoms";
import { useTokenAddresses } from "../context/Token";

export function useBlockchains(): Array<string> {
  const blockchains = useRecoilValue(atoms.blockchainKeys);
  return blockchains;
}

export function useBlockchainTokens(blockchain: string): Array<string> {
  return useRecoilValue(atoms.blockchainTokens(blockchain));
}

export function useBlockchainBalance(blockchain: string, address: string) {
  const balance = useRecoilValue(
    atoms.blockchainTokenAccounts({ blockchain, address })
  );
  return balance;
}

//	const tokenAddresses e= useTokenAddresses();
//	console.log('got token addresses!', tokenAddresses);
