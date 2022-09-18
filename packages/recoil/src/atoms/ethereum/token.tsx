import { atom, selector, selectorFamily } from "recoil";
import { ethers, BigNumber } from "ethers";
import { TokenInfo } from "@solana/spl-token-registry";
import { UniswapTokenList, ETH_NATIVE_MINT } from "@coral-xyz/common";
import type {
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
import { Multicall } from "ethereum-multicall";
import { TokenData } from "../../types";
import { priceData } from "../prices";
import { ethereumPublicKey } from "../wallet";
import { ethersContext } from "./provider";
import { ethereumTokenMetadata } from "./token-metadata";

// Atom family to trigger Ethereum balance updates
export const ethereumBalancePoll = atom({
  key: "ethereumBalancePoll",
  default: 0,
});

// Map of ETH native balance and all ERC20 balances
// We use a dummy address for the ETH balance (zero address) so it can be
// treated like an ERC20 in state.
export const ethereumBalances = atom<Map<string, BigNumber>>({
  key: "ethereumBalances",
  default: selector({
    key: "ethereumBalancesDefault",
    get: ({ get }: any) => {
      const ethPublicKey = get(ethereumPublicKey);
      if (!ethPublicKey) return new Map();
      const balanceMap = get(erc20Balances);
      // Add ETH balance at dummy address
      balanceMap.set(ETH_NATIVE_MINT, get(ethBalance));
      return balanceMap;
    },
  }),
});

// Native ETH balance
export const ethBalance = atom<BigNumber>({
  key: "ethereumBalance",
  default: selector({
    key: "ethereumBalanceDefault",
    get: ({ get }: any) => {
      const ethPublicKey = get(ethereumPublicKey);
      if (!ethPublicKey) return BigNumber.from(0);
      const provider = get(ethersContext).provider;
      return provider.getBalance(ethPublicKey);
    },
  }),
});

// ERC20 Token Balances
export const erc20Balances = selector({
  key: "ethereumTokenBalances",
  get: async ({ get }: any) => {
    const publicKey = get(ethereumPublicKey);
    if (!publicKey) {
      return new Map();
    }

    // Trigger for balance updates
    get(ethereumBalancePoll);

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
          return [
            contractAddress,
            callsReturnContext[0].returnValues[0] as BigNumber,
          ];
        })
    );
  },
});

export const ethereumTokenBalance = selectorFamily<TokenData | null, string>({
  key: "ethereumTokenBalance",
  get:
    (contractAddress: string) =>
    ({ get }) => {
      const ethTokenMetadata = get(ethereumTokenMetadata)();
      const ethTokenBalances: Map<String, BigNumber> = get(ethereumBalances);

      const tokenMetadata =
        ethTokenMetadata!.get(contractAddress) ?? ({} as TokenInfo);
      const { symbol: ticker, logoURI: logo, name, decimals } = tokenMetadata;

      const nativeBalance = ethTokenBalances.get(contractAddress)
        ? BigNumber.from(ethTokenBalances.get(contractAddress))
        : BigNumber.from(0);
      const displayBalance = ethers.utils.formatUnits(nativeBalance, decimals);

      const price = get(priceData(contractAddress)) as any;
      const usdBalance =
        price && price.usd ? price.usd * parseFloat(displayBalance) : 0;
      const oldUsdBalance =
        usdBalance === 0 ? 0 : usdBalance / (1 + price.usd_24h_change);
      const recentUsdBalanceChange =
        (usdBalance - oldUsdBalance) / oldUsdBalance;
      const recentPercentChange =
        price && price.usd_24h_change
          ? parseFloat(price.usd_24h_change.toFixed(2))
          : undefined;

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
