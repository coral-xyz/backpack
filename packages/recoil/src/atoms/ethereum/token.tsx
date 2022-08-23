import { atomFamily, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
import { TokenInfo } from "@solana/spl-token-registry";
import { ethersContext } from "./provider";
import { bootstrap } from "../bootstrap";
import { TokenData } from "../../types";

export const ethereumTokenBalance = selectorFamily<TokenData | null, string>({
  key: "ethereumTokenBalance",
  get:
    (contractAddress: string) =>
    ({ get }) => {
      const data = get(bootstrap);

      const tokenMetadata =
        data.ethTokenMetadata.get(contractAddress) ?? ({} as TokenInfo);
      const { symbol: ticker, logoURI: logo, name, decimals } = tokenMetadata;

      const nativeBalance = data.ethTokenBalances.get(contractAddress)
        ? BigNumber.from(data.ethTokenBalances.get(contractAddress))
        : BigNumber.from(0);
      const displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);

      // TODO pricing
      // const price = get(ethereumPriceData(contractAddress));
      const usdBalance = 0;
      const oldUsdBalance = 0;
      const recentUsdBalanceChange = 0;
      const recentPercentChange = 0;

      return {
        name,
        decimals,
        nativeBalance,
        displayBalance,
        ticker,
        logo,
        address: contractAddress,
        usdBalance,
        recentPercentChange,
        recentUsdBalanceChange,
      } as TokenData;
    },
});

export const ethereumTokenBalances = atomFamily<
  Map<string, BigNumber>,
  { contractAddresses: string[]; publicKey: string }
>({
  key: "ethereumTokenBalances",
  default: selectorFamily({
    key: "ethereumTokenBalancesDefault",
    get:
      ({
        contractAddresses,
        publicKey,
      }: {
        contractAddresses: Array<string>;
        publicKey: string;
      }) =>
      async ({ get }) => {
        //
        // Use a multicall contract to load Ethereum balances.
        // There might be other more performant options if this needs improving:
        //
        // - GraphQL API on Ethereum node
        // - Alchemy extended API methods
        // - Other APIs (e.g. Etherscan)
        // - Custom infrastructure
        //
        const provider = get(ethersContext).provider;

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
      },
  }),
});
