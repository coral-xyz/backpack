import { ethers } from "ethers";
import type {
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
import { Multicall } from "ethereum-multicall";

// Dummy representation of native ETH.
export const ETH_NATIVE_MINT = ethers.constants.AddressZero;

export async function ethereumBalances(
  provider: ethers.providers.Provider,
  contractAddresses: string[],
  publicKey: string
) {
  const [ethBalance, tokenBalances] = await Promise.all([
    provider.getBalance(publicKey),
    ethereumTokenBalances(provider, contractAddresses, publicKey),
  ]);

  const balanceMap = tokenBalances;
  balanceMap.set(ETH_NATIVE_MINT, ethBalance);
  return balanceMap;
}

export async function ethereumTokenBalances(
  provider: ethers.providers.Provider,
  contractAddresses: string[],
  publicKey: string
) {
  //
  // Use a multicall contract to load Ethereum balances.
  // There might be other more performant options if this needs improving:
  //
  // - GraphQL API on Ethereum node
  // - Alchemy extended API methods
  // - Other APIs (e.g. Etherscan)
  // - Custom infrastructure
  //
  const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true,
  });

  // Only balanceOf ERC20 ABI
  const abi = [
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "balance",
          type: "uint256",
        },
      ],
      payable: false,
      type: "function",
    },
  ];

  const contractCallContext = contractAddresses.map((contractAddress) => {
    return {
      reference: contractAddress,
      contractAddress: contractAddress,
      abi: abi,
      calls: [
        {
          reference: "balanceOf",
          methodName: "balanceOf",
          methodParameters: [publicKey],
        },
      ],
    } as ContractCallContext;
  });

  const contractCall: ContractCallResults = await multicall.call(
    contractCallContext
  );

  return new Map(
    Object.entries(contractCall.results).map(
      ([contractAddress, { callsReturnContext }]) => {
        return [contractAddress, callsReturnContext[0].returnValues[0]];
      }
    )
  );
}
