import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { PrimaryButton } from "@coral-xyz/react-common";
import {
  blockchainClientAtom,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { explorerAddressUrl } from "@coral-xyz/secure-background/legacyCommon";
import type { SolanaClient } from "@coral-xyz/secure-clients";
import { useEpochInfoQuery, useIsMounted } from "@coral-xyz/staking/src/hooks";
import {
  lamportsToSolAsString,
  stakeStateColor,
} from "@coral-xyz/staking/src/shared";
import {
  openUrl,
  StyledText,
  TableCore,
  TableRowCore,
  YStack,
} from "@coral-xyz/tamagui";
import { capitalize } from "@mui/material";
import type { StakeActivationData } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type StakeScreenProps,
} from "../../../navigation/StakeNavigator";

export function StakeDetailScreen(
  props: StakeScreenProps<Routes.StakeDetailScreen>
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

export const Container = ({
  navigation,
  route: {
    params: { stake },
  },
}: StakeScreenProps<Routes.StakeDetailScreen>) => {
  const blockchainClient = useRecoilValue(
    blockchainClientAtom(Blockchain.SOLANA)
  ) as SolanaClient;
  const { t } = useTranslation();
  const epochQuery = useEpochInfoQuery();
  const { publicKey } = useActiveWallet();

  const is = stakeStateIs(stake.stakeActivation?.state);

  // const nextEpochTimeQuery = useNextEpochTimeQuery(
  //   connection,
  //   epochQuery,
  //   is("activating", "deactivating")
  // );

  const isMounted = useIsMounted();

  // const timeRemaining =
  //   nextEpochTimeQuery.data && is("activating", "deactivating")
  //     ? `in approx ${nextEpochTimeQuery.data.timeRemaining}`
  //     : undefined;

  const deactivate = async () => {
    try {
      if (!stake.pubkey) return;

      const signature = await blockchainClient.Stake.deactivate({
        authority: publicKey,
        stakeAccount: stake.pubkey,
      });

      if (isMounted.current) {
        return navigation.replace(Routes.StakeConfirmationScreen, {
          signature,
          progressTitle: t("confirming_unstake"),
          afterTitle: t("unstaked"),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const withdraw = async () => {
    try {
      if (!stake.pubkey) return;

      const signature = await blockchainClient.Stake.withdraw({
        authority: publicKey,
        stakeAccount: stake.pubkey,
      });

      if (isMounted.current) {
        return navigation.replace(Routes.StakeConfirmationScreen, {
          signature,
          progressTitle: t("confirming_withdrawal"),
          afterTitle: t("withdrawal_complete"),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unlockDate = new Date(
    stake.stakeAccount ? stake.stakeAccount.meta.lockup.unixTimestamp * 1000 : 0
  );
  const now = new Date();

  const isActivePublicKey = (key?: string) => key && key === publicKey;

  const canWithdraw =
    is("inactive") &&
    stake.stakeAccount &&
    unlockDate <= now &&
    (epochQuery.data?.epoch && stake.stakeAccount.meta.lockup.epoch
      ? stake.stakeAccount.meta.lockup.epoch <= epochQuery.data.epoch
      : true) &&
    isActivePublicKey(stake.stakeAccount.meta.authorized.withdrawer);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        padding: 16,
        textAlign: "center",
      }}
    >
      <StyledText
        fontSize="$2xl"
        fontWeight="$bold"
        color={is("active") ? "$baseTextHighEmphasis" : "$baseTextMedEmphasis"}
      >
        {stake.stakeAccount
          ? lamportsToSolAsString(stake.stakeAccount.stake.delegation.stake, {
              appendTicker: true,
            })
          : null}
      </StyledText>
      <YStack marginVertical={16} flex={1}>
        <TableCore>
          <TableRowCore
            label={
              <StyledText
                color="$baseTextHighEmphasis"
                fontSize="$sm"
                textAlign="left"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                marginRight={10}
              >
                {stake.validator?.name}
              </StyledText>
            }
            valueColor={
              stake.stakeActivation
                ? stakeStateColor[stake.stakeActivation.state]
                : undefined
            }
            value={
              stake.stakeActivation
                ? capitalize(stake.stakeActivation.state)
                : // [capitalize(stake.stakeActivation.state), timeRemaining]
                  //   .filter(Boolean)
                  //   .join(" ")
                  undefined
            }
          />

          <PublicKeyRow title={t("address")} pubkey={stake.pubkey} />

          <TableRowCore
            label={t("total_balance")}
            value={
              stake.lamports !== undefined
                ? lamportsToSolAsString(stake.lamports, {
                    appendTicker: true,
                  })
                : null
            }
          />
          <TableRowCore
            label={t("rent_reserve")}
            value={
              stake.stakeAccount !== undefined
                ? lamportsToSolAsString(
                    stake.stakeAccount.meta.rentExemptReserve,
                    {
                      appendTicker: true,
                    }
                  )
                : null
            }
          />
          {stake.stakeActivation?.active ? (
            <TableRowCore
              label={t("active_stake")}
              value={lamportsToSolAsString(stake.stakeActivation.active, {
                appendTicker: true,
              })}
              valueColor={
                is("active") ? "$baseTextHighEmphasis" : "$baseTextMedEmphasis"
              }
            />
          ) : null}
          {stake.rewards?.amount ? (
            <TableRowCore
              label={t("last_reward")}
              valueColor={is("active") ? "$greenText" : "$baseTextMedEmphasis"}
              value={`+${lamportsToSolAsString(stake.rewards.amount, {
                appendTicker: true,
              })}`}
            />
          ) : null}

          {unlockDate > now ? (
            <TableRowCore
              label={t("lockup_until")}
              value={unlockDate.toLocaleString()}
            />
          ) : null}

          {epochQuery.data &&
          stake.stakeAccount &&
          epochQuery.data.epoch < stake.stakeAccount.meta.lockup.epoch ? (
            <TableRowCore
              label={t("unlock_epoch")}
              value={`${stake.stakeAccount.meta.lockup.epoch} (${
                stake.stakeAccount.meta.lockup.epoch - epochQuery.data.epoch
              } from now)`}
            />
          ) : null}

          {!isActivePublicKey(stake.stakeAccount?.meta.lockup.custodian) &&
          stake.stakeAccount?.meta.lockup.custodian !==
            "11111111111111111111111111111111" ? (
              <PublicKeyRow
                title={t("lockup_custodian")}
                pubkey={stake.stakeAccount?.meta.lockup.custodian}
            />
          ) : null}

          {!isActivePublicKey(stake.stakeAccount?.meta.authorized.staker) ? (
            <PublicKeyRow
              title={t("stake_authority")}
              pubkey={stake.stakeAccount?.meta.authorized.staker}
            />
          ) : null}

          {!isActivePublicKey(
            stake.stakeAccount?.meta.authorized.withdrawer
          ) ? (
            <PublicKeyRow
              title={t("authorized_withdrawer")}
              pubkey={stake.stakeAccount?.meta.authorized.withdrawer}
            />
          ) : null}
        </TableCore>
      </YStack>
      {canWithdraw ? (
        <PrimaryButton
          label={t("withdraw_sol_and_close_account")}
          onClick={withdraw}
        />
      ) : is("active", "activating") ? (
        <PrimaryButton label={t("unstake")} onClick={deactivate} />
      ) : null}
    </div>
  );
};

const PublicKeyRow = ({
  title,
  pubkey,
}: {
  title: string;
  pubkey?: string;
}) => {
  const { blockchain } = useActiveWallet();
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const explorer = useBlockchainExplorer(blockchain);
  return (
    <TableRowCore
      label={title}
      value={pubkey ? formatWalletAddress(pubkey) : ""}
      onPress={
        pubkey
          ? () => openUrl(explorerAddressUrl(explorer, pubkey, connectionUrl))
          : undefined
      }
    />
  );
};

const stakeStateIs =
  (state?: StakeActivationData["state"]) =>
  (...statuses: StakeActivationData["state"][]) =>
    Boolean(state && statuses.includes(state));
