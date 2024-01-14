import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import type { ProviderId } from "@coral-xyz/data-components";
import { GET_TOKEN_BALANCES_QUERY } from "@coral-xyz/data-components";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";

import { SearchableTokenTable } from "../../../../components/common/TokenTable";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type SendTokenSelectScreenProps,
} from "../../../navigation/SendNavigator";

export function SendTokenSelectScreen(props: SendTokenSelectScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container({ navigation }: SendTokenSelectScreenProps) {
  const { blockchain, publicKey } = useActiveWallet();

  const { data } = useQuery(GET_TOKEN_BALANCES_QUERY, {
    fetchPolicy: "cache-only",
    variables: {
      address: publicKey,
      providerId: blockchain.toUpperCase() as ProviderId,
    },
  });

  const tokens = useMemo(
    () => data?.wallet?.balances?.tokens.edges.map((e) => e.node) ?? [],
    [data]
  );

  return (
    <SearchableTokenTable
      tokens={tokens}
      onClickRow={(blockchain, token) => {
        navigation.push(Routes.SendAddressSelectScreen, {
          blockchain,
          assetId: token.id,
        });
      }}
      customFilter={(token) => {
        if (token.token === SOL_NATIVE_MINT) {
          return true;
        }
        if (token.token === ETH_NATIVE_MINT) {
          return true;
        }
        return parseFloat(token.amount) !== 0;
      }}
    />
  );
}
