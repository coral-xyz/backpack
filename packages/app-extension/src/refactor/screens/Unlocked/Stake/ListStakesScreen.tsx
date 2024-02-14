import { useTranslation } from "@coral-xyz/i18n";
import { EmptyState } from "@coral-xyz/react-common";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  useSortedAccountsQuery,
  useValidatorsQuery,
} from "@coral-xyz/staking/src/hooks";
import {
  lamportsToSolAsString,
  type StakeInfo,
} from "@coral-xyz/staking/src/shared";
import { BarChart4Icon, YStack } from "@coral-xyz/tamagui";
import { capitalize } from "@mui/material";

import {
  AutosizedWindowedList,
  SkeletonRow,
} from "../../../../components/common/TokenTable";
import { AddButton } from "../../../../components/common/WalletList";
import { StakesTableCell } from "../../../../components/Unlocked/Stake/StakesTableCell";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type StakeScreenProps,
} from "../../../navigation/StakeNavigator";

export function ListStakesScreen(
  props: StakeScreenProps<Routes.ListStakesScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return null;
}

function Container(props: StakeScreenProps<Routes.ListStakesScreen>) {
  const { route } = props;
  const { forceRefreshKey } = route.params ?? { forceRefreshKey: "container" };

  // We use this forceRefreshKey to force remount the component. This
  // is useful for callers that navigate to this screen and want to
  // ensure a fresh set of state. For example, when navigating back
  // from the bottom of the stack back to the top.
  //
  // If there's a better way of doing this, please do it.
  return <ContainerInner key={forceRefreshKey} {...props} />;
}

function ContainerInner({
  navigation,
}: StakeScreenProps<Routes.ListStakesScreen>) {
  const { t } = useTranslation();
  const { publicKey } = useActiveWallet();

  const sortedAccounts = useSortedAccountsQuery(publicKey);

  const validators = useValidatorsQuery();

  const onAdd = () => {
    navigation.push(Routes.NewStakeScreen);
  };

  const renderer = (props: {
    index: number;
    data: {
      sortedAccounts?: StakeInfo[];
      validators: any[];
      onClickRow: (stake: any) => void;
    };
    style: any;
  }) => {
    const { index, style } = props;
    if (
      sortedAccounts.hasLoadedSomeData &&
      index === sortedAccounts.data.length
    ) {
      return (
        <div key="add" style={style}>
          <AddButton onClick={onAdd} label={t("add_stake")} />
        </div>
      );
    } else {
      return <StakeRowRenderer {...props} />;
    }
  };

  if (sortedAccounts.hasLoadedSomeData && sortedAccounts.data.length === 0) {
    return (
      <YStack jc="center" height="100%" pl={16} pr={16}>
        <ListStakesEmpty navigation={navigation} />
      </YStack>
    );
  }

  return (
    <YStack height="100%">
      <AutosizedWindowedList
        itemCount={
          sortedAccounts.hasLoadedSomeData ? sortedAccounts.data.length + 1 : 8
        }
        itemData={{
          sortedAccounts: sortedAccounts.data,
          validators: validators.data,
          onClickRow: (stake: any) => {
            if (stake) {
              navigation.push(Routes.StakeDetailScreen, { stake });
            }
          },
        }}
        // @ts-ignore
        renderer={renderer}
      />
    </YStack>
  );
}

const StakeRowRenderer = ({
  index,
  data,
  style,
}: {
  index: number;
  data: {
    sortedAccounts?: StakeInfo[];
    validators: any[];
    onClickRow: (stake: any) => void;
  };
  style: any;
}) => {
  const account = data.sortedAccounts?.[index];
  const validator = (data.validators || [])?.find(
    (v) => account?.stakeAccount?.stake.delegation.voter === v.info.votePubkey
  );

  return (
    <YStack
      key={account?.pubkey}
      hoverStyle={
        validator
          ? {
              cursor: "pointer",
              backgroundColor: "$baseBackgroundL2",
            }
          : undefined
      }
      paddingHorizontal="$4"
      style={style}
      onPress={
        validator ? () => data.onClickRow({ ...account, validator }) : undefined
      }
    >
      {account ? (
        <StakesTableCell
          props={{
            validator,
            state: account.stakeActivation?.state
              ? capitalize(account.stakeActivation.state)
              : "",
            amount: account.stakeAccount?.stake.delegation.stake
              ? lamportsToSolAsString(
                  account.stakeAccount.stake.delegation.stake
                )
              : "",
            reward: account.rewards?.amount
              ? lamportsToSolAsString(account.rewards.amount)
              : undefined,
          }}
        />
      ) : (
        <SkeletonRow />
      )}
    </YStack>
  );
};

function ListStakesEmpty({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={(props: any) => <BarChart4Icon {...props} />}
      title={t("no_stakes.title")}
      subtitle={t("no_stakes.subtitle")}
      buttonText={t("add_stake")}
      onClick={() => navigation.push(Routes.NewStakeScreen)}
    />
  );
}
