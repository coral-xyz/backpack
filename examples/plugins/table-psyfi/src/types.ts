export type Vault = {
  deposits: { max: number; current: number };
  name: string;
  fees: { withdrawal: number; performance: number };
  strategyType: number;
  visibility: number;
  staking: {
    stakePoolKey: string;
    stakingApr: number[];
    poolRewards: {
      rewardPoolKey: string;
      metadata: {
        rewardInUsdPerYearPerRewardUnit: number;
        usdValuePerRewardToken: number;
        rewardPoolApr: number[];
      };
      rewardMintAddress: string;
      rewardTokensPerWeek: number;
      poolId: number;
      multiplier: number;
      tokenSymbol: string;
    }[];
    metadata: { usdValuePerVaultToken: number };
  };
  id: string;
  valuePerVaultToken: number;
  selectedStrike: number;
  accounts: {
    vaultAddress: string;
    feeTokenAccount: string;
    collateralAssetMint: string;
    optionsUnderlyingMint: string;
    pythPriceOracle: string;
    vaultOwnershipTokenMint: string;
  };
  version: number;
  status: {
    nextEpochStartTime: number;
    optionsActive: boolean;
    isDeprecated: boolean;
    currentEpoch: number;
    nextOptionMintTime: number;
  };
  apy: {
    weightedApy: {
      apyBeforeFees: number;
      targetDelta: number;
      averageHistoricalLoss: number;
      epochsCounted: number;
      apyAfterFees: number;
      averageSaleYield: number;
    };
    stakingApy: number;
    currentEpochApy: number;
  };
  vaultHistory: [];
};
export type VaultsResponse = {
  vaults: Record<string, Vault>;
};
