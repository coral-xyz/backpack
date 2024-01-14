import { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { generateUniqueId } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { CheckIcon, Loading, SecondaryButton } from "@coral-xyz/react-common";
import {
  solanaClientAtom,
  useActiveWallet,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import type { ProviderId } from "@coral-xyz/recoil/src/apollo/graphql";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import { SOL_NATIVE_MINT } from "@coral-xyz/secure-clients/legacyCommon";
import { PrimaryButton, StyledText } from "@coral-xyz/tamagui";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import useAsyncEffect from "use-async-effect";

import {
  GET_TOKEN_BALANCES_QUERY,
  GET_TRANSACTIONS_QUERY,
} from "../../../../../../data-components/src";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  Routes,
  type StakeScreenProps,
} from "../../../navigation/StakeNavigator";

import { sleep } from "./shared";

export function StakeConfirmationScreen(
  props: StakeScreenProps<Routes.StakeConfirmationScreen>
) {
  return (
    <ScreenContainer loading={<LoadingContainer />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function LoadingContainer() {
  return null;
}

const Container = ({
  navigation,
  route: {
    params: { signature, delay = 1000, afterTitle },
  },
}: StakeScreenProps<Routes.StakeConfirmationScreen>) => {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = useState(false);
  const { blockchain, publicKey } = useActiveWallet();
  const queryClient = useQueryClient();
  const solanaClient = useRecoilValue(solanaClientAtom);
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const [error, setError] = useState<string>();
  const apollo = useApolloClient();

  useAsyncEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async (isMounted) => {
      try {
        await solanaClient.confirmTransaction(signature);

        // After 2s, update graphql cache, no need to await it
        setTimeout(() => {
          const providerId = blockchain.toUpperCase() as ProviderId;
          // Refresh wallet balances
          void apollo.query({
            query: GET_TOKEN_BALANCES_QUERY,
            fetchPolicy: "network-only",
            variables: {
              address: publicKey,
              providerId,
            },
          });
          // Refresh SOL transactions
          void apollo.query({
            query: GET_TRANSACTIONS_QUERY,
            fetchPolicy: "network-only",
            variables: {
              address: publicKey,
              providerId,
              filters: {
                token: SOL_NATIVE_MINT,
              },
            },
          });
        }, 2000);

        await Promise.allSettled([
          // Give enough time for UI to update
          sleep(delay),
          // Clear react-query cache
          queryClient.invalidateQueries({
            queryKey: ["staking", publicKey],
          }),
        ]);

        if (isMounted()) {
          setConfirmed(true);
          navigation.setOptions({
            title: afterTitle,
          });
        }
      } catch (err: any) {
        if (isMounted()) {
          console.error(err);
          setError(err.message || "Error");
        }
      }
    },
    [signature]
  );

  return (
    <ScreenContainer>
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {error ? (
            <StyledText color="$redText">
              There was an error confirming this transaction: '{error}'
            </StyledText>
          ) : confirmed ? (
            <CheckIcon />
          ) : (
            <Loading
              size={48}
              iconStyle={{
                display: "flex",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              thickness={6}
            />
          )}
        </div>

        {error || confirmed ? (
          <PrimaryButton
            onClick={() =>
              navigation.navigate(Routes.ListStakesScreen, {
                forceRefreshKey: generateUniqueId(),
              })
            }
            label={t("view_stakes")}
          />
        ) : null}
        <div style={{ marginTop: 16 }}>
          <SecondaryButton
            label={t("view_explorer")}
            type="button"
            onClick={() => {
              window.open(
                explorerUrl(explorer, signature, connectionUrl),
                "_blank"
              );
            }}
          />
        </div>
      </div>
    </ScreenContainer>
  );
};
