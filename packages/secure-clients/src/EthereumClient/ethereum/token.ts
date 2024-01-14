import type {
  ContractCallContext,
  ContractCallResults,
} from "ethereum-multicall";
import { Multicall } from "ethereum-multicall";
import { BigNumber, ethers } from "ethers5";

import { UniswapTokenList } from "./tokens-uniswap";

// Dummy representation of native ETH.
export const ETH_NATIVE_MINT = ethers.constants.AddressZero;

export async function fetchEthereumBalances(
  provider: ethers.providers.Provider,
  publicKey: string
) {
  const [ethBalance, tokenBalances] = await Promise.all([
    provider.getBalance(publicKey),
    fetchEthereumTokenBalances(provider, publicKey),
  ]);

  const balanceMap = tokenBalances;
  balanceMap.set(ETH_NATIVE_MINT, ethBalance);
  return balanceMap;
}

export async function fetchEthereumTokenBalances(
  provider: ethers.providers.Provider,
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

  const contractAddresses = UniswapTokenList.tokens.map(
    (token) => token.address
  );

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

  const contractCallContext = contractAddresses
    .filter((c) => c !== ETH_NATIVE_MINT)
    .map((contractAddress) => {
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
    Object.entries(contractCall.results)
      .filter(([_, { callsReturnContext }]) => {
        return (
          callsReturnContext[0]?.returnValues[0] &&
          !BigNumber.from(callsReturnContext[0]?.returnValues[0]).isZero()
        );
      })
      .map(([contractAddress, { callsReturnContext }]) => {
        return [contractAddress, callsReturnContext[0]?.returnValues[0]];
      })
  );
}

export function ethereumTokenData() {
  const ETH_LOGO_URI =
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

  const tokenMap: Map<string, any> = new Map(
    UniswapTokenList.tokens.map((t: any) => {
      return [t.address, t];
    })
  );
  tokenMap.set(ETH_NATIVE_MINT, {
    name: "Ethereum",
    address: ETH_NATIVE_MINT,
    chainId: 1,
    decimals: 18,
    symbol: "ETH",
    logoURI: ETH_LOGO_URI,
    extensions: {
      coingeckoId: "ethereum",
    },
  });
  return tokenMap;
}
