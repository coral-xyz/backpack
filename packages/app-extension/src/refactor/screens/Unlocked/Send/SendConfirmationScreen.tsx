import { useCallback, useEffect, useState } from "react";
import { gql, useApolloClient, useFragment } from "@apollo/client";
import { UNKNOWN_ICON_SRC, wait } from "@coral-xyz/common";
import {
  GET_TOKEN_BALANCES_QUERY,
  type ProviderId,
} from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import { blockchainClientAtom, useActiveWallet } from "@coral-xyz/recoil";
import { ListItemIconCore, YStack } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";
import { useAsyncEffect } from "use-async-effect";

import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  ConfirmationButtons,
  ConfirmationIcon,
  ConfirmationSubtitle,
  ConfirmationTokenAmountHeader,
} from "../../../components/TransactionConfirmation";
import type { SendConfirmationScreenProps } from "../../../navigation/SendNavigator";

export function SendConfirmationScreen(props: SendConfirmationScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return null;
}

type _TokenBalanceConfirmationFragment = {
  token?: string;
  tokenListEntry?: {
    logo?: string;
    symbol?: string;
  };
};

function Container({ navigation, route }: SendConfirmationScreenProps) {
  const { amount, signature, tokenId } = route.params;

  const { t } = useTranslation();
  const { blockchain, publicKey } = useActiveWallet();
  const apollo = useApolloClient();
  const client = useRecoilValue(blockchainClientAtom(blockchain));
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  // Set the header of the screen based on the state of the confirmation
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isConfirmed ? t("send_confirmed") : t("sending_dots"),
    });
  }, [isConfirmed, navigation, t]);

  // Handle the asynchronous confirmation of the transaction signature
  // and refresh the cache data with the updated query response after success
  useAsyncEffect(async () => {
    try {
      await client.confirmTransaction(signature);
      await wait(2);
      await apollo.query({
        query: GET_TOKEN_BALANCES_QUERY,
        fetchPolicy: "network-only",
        variables: {
          address: publicKey,
          providerId: blockchain.toUpperCase() as ProviderId,
        },
      });
      setIsConfirmed(true);
    } catch (e) {
      const error = e as Error;
      setErrorMessage(error?.message ?? t("failed"));
    }
  }, [
    apollo,
    blockchain,
    client,
    publicKey,
    setErrorMessage,
    setIsConfirmed,
    signature,
    t,
  ]);

  // Handle the navigation pop back to the root
  const handlePressPrimary = useCallback(() => {
    if (isConfirmed) {
      navigation.popToTop();
      navigation.popToTop();
    }
  }, [isConfirmed, navigation]);

  // Fetch the Apollo cache data for the argued token balance node ID
  const { data } = useFragment<_TokenBalanceConfirmationFragment>({
    fragmentName: "TokenBalanceConfirmationFragment",
    from: {
      __typename: "TokenBalance",
      id: tokenId,
    },
    fragment: gql`
      fragment TokenBalanceConfirmationFragment on TokenBalance {
        token
        tokenListEntry {
          logo
          symbol
        }
      }
    `,
  });

  const symbol = data?.tokenListEntry?.symbol || "";
  const subtitle = errorMessage || t("send_pending", { symbol });

  return (
    <YStack ai="center" f={1} gap={40} p={16}>
      <YStack ai="center" gap={18}>
        <ConfirmationTokenAmountHeader
          amount={amount}
          symbol={symbol}
          icon={
            <ListItemIconCore
              radius="$circular"
              size={40}
              image={data?.tokenListEntry?.logo || UNKNOWN_ICON_SRC}
            />
          }
        />
      </YStack>
      <ConfirmationIcon confirmed={isConfirmed} hasError={!!errorMessage} />
      <ConfirmationSubtitle confirmed={isConfirmed} content={subtitle} />
      <ConfirmationButtons
        blockchain={blockchain}
        confirmed={isConfirmed}
        confirmedLabel={t("view_balances")}
        onConfirmedPress={handlePressPrimary}
        signature={signature}
      />
    </YStack>
  );
}
