import { useActiveWallet } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";

import { Routes as StakeRoutes } from "../../../refactor/navigation/StakeNavigator";
import { Routes } from "../../../refactor/navigation/WalletsNavigator";
import {
  useInflationRewardsQuery,
  useProgramAccountsQuery,
} from "../../../refactor/screens/Unlocked/Stake/hooks";
import { lamportsToSolAsString } from "../../../refactor/screens/Unlocked/Stake/shared";

import { StakeButtonComponent } from "./StakeButtonComponent";

/**
 * Loaded lazily on the Solana Token Detail Page, hence the default function export
 */
export default function StakeButton() {
  const { publicKey } = useActiveWallet();
  const navigation = useNavigation<any>();

  const programAccountsQuery = useProgramAccountsQuery(publicKey);
  const { data, isError, isLoading } = programAccountsQuery;

  const subtitle = isError
    ? "Error fetching accounts"
    : isLoading
    ? undefined
    : data && data.length > 0
    ? `${data.length} account${data.length > 1 ? "s" : ""}`
    : "Stake some SOL";

  const total =
    data && data?.length > 0
      ? `${lamportsToSolAsString(
          data.reduce((acc, curr) => acc + curr.lamports, 0),
          { appendTicker: true }
        )}`
      : "";

  const inflationRewards = useInflationRewardsQuery(publicKey);

  const totalInflationRewards = inflationRewards.data?.reduce(
    (acc, [_, curr]) => acc + (curr?.amount ?? 0),
    0
  );

  const totalRewards =
    totalInflationRewards !== undefined
      ? totalInflationRewards > 0
        ? `+${lamportsToSolAsString(totalInflationRewards, {
            appendTicker: true,
          })}`
        : ""
      : undefined;

  return (
    <StakeButtonComponent
      subtitle={subtitle}
      total={total}
      totalRewards={totalRewards}
      handleClick={
        isError
          ? undefined
          : () => {
              navigation.push(Routes.StakeNavigator, {
                screen: StakeRoutes.ListStakesScreen,
                params: undefined,
              });
            }
      }
    />
  );
}
