import { useState } from "react";
import { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { PrimaryButton } from "@coral-xyz/react-common";
import { blockchainClientAtom, useActiveWallet } from "@coral-xyz/recoil";
import type { SolanaClient } from "@coral-xyz/secure-clients";
import {
  useEpochInfoQuery,
  useIsMounted,
  useSortedAccountsQuery,
} from "@coral-xyz/staking/src/hooks";
import {
  isMergeableStakeAccount,
  lamportsToSolAsString,
} from "@coral-xyz/staking/src/shared";
import { StyledText, XStack, YStack } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";

import { RoundCheckBoxLabel } from "../../../../components/common/Account/ImportWallets";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type StakeScreenProps,
} from "../../../navigation/StakeNavigator";

export function MergeStakeScreen(
  props: StakeScreenProps<Routes.MergeStakeScreen>
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

const Container = ({
  navigation,
  route: {
    params: { pubkey },
  },
}: StakeScreenProps<Routes.MergeStakeScreen>) => {
  const blockchainClient = useRecoilValue(
    blockchainClientAtom(Blockchain.SOLANA)
  ) as SolanaClient;

  const [stakeAccount, setStakeAccount] = useState<string>();
  const { publicKey } = useActiveWallet();
  const { t } = useTranslation();

  const epochInfoQuery = useEpochInfoQuery();

  const sortedAccounts = useSortedAccountsQuery(publicKey);

  const isMounted = useIsMounted();

  const account = sortedAccounts.data.find((a) => a.pubkey === pubkey);

  const mergeableAccounts = sortedAccounts.data.filter(
    // @ts-ignore
    isMergeableStakeAccount(publicKey, epochInfoQuery.data?.epoch, account)
  );

  const merge = async () => {
    try {
      if (!stakeAccount) return;

      const signature = await blockchainClient.Stake.merge({
        authority: publicKey,
        stakeAccountToClose: stakeAccount,
        stakeAccountToMergeInto: pubkey,
      });

      if (isMounted.current) {
        return navigation.replace(Routes.StakeConfirmationScreen, {
          signature,
          progressTitle: "Confirming Merge",
          afterTitle: "Merged",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        textAlign: "center",
        flex: 1,
      }}
    >
      <StyledText fontSize="$md" color="$baseTextHighEmphasis">
        Choose an account to merge
      </StyledText>

      <YStack marginVertical={16} flex={1}>
        <XStack
          jc="space-between"
          space="$1"
          paddingHorizontal="$2"
          marginBottom="$2"
        >
          <StyledText
            fontSize="$sm"
            color="$baseTextMedEmphasis"
            paddingLeft={24}
          >
            {t("total_balance").concat(" (SOL)")}
          </StyledText>
          <StyledText
            fontSize="$sm"
            color="$baseTextMedEmphasis"
            textAlign="right"
          >
            {t("active_stake").concat(" (SOL)")}
          </StyledText>
        </XStack>
        <YStack space="$4">
          {mergeableAccounts.map((a) => (
            <XStack
              key={a.pubkey}
              ai="center"
              jc="space-between"
              onPress={() => setStakeAccount(a.pubkey)}
              cursor="pointer"
              userSelect="none"
              hoverStyle={{
                opacity: 0.9,
              }}
            >
              <RoundCheckBoxLabel
                onPress={() => {}}
                checked={a.pubkey === stakeAccount}
                label={
                  <YStack space="$1" paddingHorizontal="$2">
                    <StyledText fontSize="$md">
                      {a.lamports ? lamportsToSolAsString(a.lamports) : ""}
                    </StyledText>
                    {/* <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
                      {formatWalletAddress(a.pubkey)}
                    </StyledText> */}
                  </YStack>
                }
              />
              <YStack space="$1" paddingHorizontal="$2">
                <StyledText textAlign="right" color="$greenText" fontSize="$sm">
                  {a.stakeAccount
                    ? lamportsToSolAsString(
                        a.stakeAccount?.stake.delegation.stake
                      )
                    : ""}
                </StyledText>
              </YStack>
            </XStack>
          ))}
        </YStack>
      </YStack>
      <PrimaryButton
        label={t("merge")}
        onClick={merge}
        disabled={!stakeAccount}
      />
    </div>
  );
};
