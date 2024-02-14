import { useState } from "react";
import { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { PrimaryButton } from "@coral-xyz/react-common";
import {
  blockchainClientAtom,
  useActiveWallet,
  useSolanaCtx,
} from "@coral-xyz/recoil";
import type { SolanaClient } from "@coral-xyz/secure-clients";
import { useIsMounted, useValidatorsQuery } from "@coral-xyz/staking/src/hooks";
import { activeValidatorPubkeyAtom } from "@coral-xyz/staking/src/shared";
import { StyledText, useTheme } from "@coral-xyz/tamagui";
import { PublicKey, StakeProgram } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { BigNumber, constants } from "ethers";
import { useRecoilValue } from "recoil";

import {
  LargeNumericInput,
  MaxAmountButton,
} from "../../../../components/Unlocked/Balances/TokensWidget/Send";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type StakeScreenProps,
} from "../../../navigation/StakeNavigator";

export function NewStakeScreen(props: StakeScreenProps<Routes.NewStakeScreen>) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return null;
}

function Container({ navigation }: StakeScreenProps<Routes.NewStakeScreen>) {
  const blockchainClient = useRecoilValue(
    blockchainClientAtom(Blockchain.SOLANA)
  ) as SolanaClient;
  const { connection } = useSolanaCtx();
  const { publicKey } = useActiveWallet();
  const theme = useTheme();
  const { t } = useTranslation();
  const [strAmount, setStrAmount] = useState("");
  const [lamportsToStake, setLamportsToStake] = useState<BigNumber | null>(
    null
  );
  const activeValidatorPubkey = useRecoilValue(activeValidatorPubkeyAtom);
  const { data: minPossibleLamportsNumber } = useQuery({
    queryKey: ["stake", "minPossibleLamports"],
    queryFn: async () => {
      const amount = await connection.getMinimumBalanceForRentExemption(
        StakeProgram.space
      );
      return amount + 1;
    },
  });
  const { data: accountLamportsNumber } = useQuery({
    queryKey: ["balance", publicKey],
    queryFn: () => connection.getBalance(new PublicKey(publicKey), "processed"),
  });
  const validators = useValidatorsQuery();
  const isMounted = useIsMounted();

  const accountLamports = accountLamportsNumber
    ? BigNumber.from(accountLamportsNumber)
    : null;

  const minPossibleLamports = minPossibleLamportsNumber
    ? BigNumber.from(minPossibleLamportsNumber)
    : null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const signature = await blockchainClient.Stake.createAndDelegate({
        authority: publicKey,
        lamports: String(lamportsToStake),
        validatorVoteAccount: activeValidatorPubkey,
      });
      if (isMounted.current) {
        return navigation.push(Routes.StakeConfirmationScreen, {
          signature,
          delay: 1500,
          progressTitle: t("confirming_stake"),
          afterTitle: t("staked"),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const maxPossibleLamports =
    accountLamports && minPossibleLamports
      ? accountLamports.sub(minPossibleLamports)
      : constants.Zero;

  const validator = validators.data?.find(
    (v) => v.info.votePubkey === activeValidatorPubkey
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div style={{ flex: 1, textAlign: "center" }}>
        <LargeNumericInput
          strAmount={strAmount}
          setStrAmount={setStrAmount}
          setAmount={setLamportsToStake}
        />
        <div style={{ marginTop: 16 }}>
          {maxPossibleLamports.gt(constants.Zero) ? (
            <MaxAmountButton
              decimals={9}
              ticker="SOL"
              maxAmount={maxPossibleLamports}
              setStrAmount={setStrAmount}
              setAmount={setLamportsToStake}
            />
          ) : null}
        </div>
        {validator ? (
          <div
            style={{ marginTop: 32, cursor: "pointer" }}
            onClick={() => navigation.push(Routes.ValidatorSelectorScreen)}
          >
            <img
              src={validator.icon}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
              }}
            />
            <div>
              <StyledText fontSize="$base">{validator.name}</StyledText>
            </div>
            {validator.details ? (
              <div
                style={{
                  // @ts-ignore
                  textWrap: "balance",
                }}
              >
                <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
                  {validator.details}
                </StyledText>
              </div>
            ) : null}
            {validator.url ? (
              <StyledText fontSize="$sm">
                <a
                  href={validator.url}
                  target="_blank"
                  style={{
                    color: theme.accentBlue.val,
                    textDecoration: "none",
                  }}
                >
                  {validator.url}
                </a>
              </StyledText>
            ) : null}
          </div>
        ) : (
          <Loading />
        )}
      </div>
      <PrimaryButton
        type="submit"
        label={t("stake")}
        disabled={
          !lamportsToStake ||
          !minPossibleLamports ||
          lamportsToStake.lte(minPossibleLamports) ||
          (maxPossibleLamports.gt(constants.Zero) &&
            lamportsToStake.gt(maxPossibleLamports))
        }
      />
    </form>
  );
}
