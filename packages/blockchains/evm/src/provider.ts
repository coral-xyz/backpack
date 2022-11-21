import { ethers, BigNumber } from "ethers";
import type {
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
import { Multicall } from "ethereum-multicall";
import { UniswapTokenList } from "./tokens";
//
// Dummy representation of native ETH.
export const ETH_NATIVE_MINT = ethers.constants.AddressZero;

export class Provider {
  getBalances = async () => {
    const [ethBalance, tokenBalances] = await Promise.all([
      this.getNativeBalance(),
      this.getTokenBalances(),
    ]);
    tokenBalances.set(ETH_NATIVE_MINT, ethBalance);
    return tokenBalances;
  };

  /**
   * Fetch ETH balance.
   *  */
  getNativeBalance = async () => {
    return provider.getBalance(publicKey);
  };

  /**
   * Fetch Ethereum token balances using the Uniswap token list.
   */
  getTokenBalances = async (
    provider: ethers.providers.Provider,
    publicKey: string
  ) => {
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
            callsReturnContext[0].returnValues[0] &&
            !BigNumber.from(callsReturnContext[0].returnValues[0]).isZero()
          );
        })
        .map(([contractAddress, { callsReturnContext }]) => {
          return [contractAddress, callsReturnContext[0].returnValues[0]];
        })
    );
  };
}
