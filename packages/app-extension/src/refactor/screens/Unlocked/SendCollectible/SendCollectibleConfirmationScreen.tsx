import { useCallback, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  externalResourceUri,
  UNKNOWN_NFT_ICON_SRC,
  wait,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { blockchainClientAtom, useActiveWallet } from "@coral-xyz/recoil";
import { Image, YStack } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";
import { useAsyncEffect } from "use-async-effect";

import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  ConfirmationButtons,
  ConfirmationIcon,
  ConfirmationSubtitle,
} from "../../../components/TransactionConfirmation";
import type { SendCollectibleConfirmationScreenProps } from "../../../navigation/SendCollectibleNavigator";

const IMAGE_SIZE = 240;

export function SendCollectibleConfirmationScreen(
  props: SendCollectibleConfirmationScreenProps
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

function Container({
  navigation,
  route,
}: SendCollectibleConfirmationScreenProps) {
  const { image, name, nftId, signature } = route.params;

  const { t } = useTranslation();
  const { blockchain } = useActiveWallet();
  const apollo = useApolloClient();
  const client = useRecoilValue(blockchainClientAtom(blockchain));
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  // Set the header of the screen based on the state of the confirmation
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isConfirmed
        ? t("send_confirmed")
        : name
        ? t("nft_send_title", { name })
        : t("sending_dots"),
    });
  }, [isConfirmed, name, navigation, t]);

  // Handle the asynchronous confirmation of the transaction signature
  // and refresh the cache data with the updated query response after success
  useAsyncEffect(async () => {
    try {
      await client.confirmTransaction(signature);
      await wait(2);
      apollo.cache.evict({ id: nftId });
      setIsConfirmed(true);
    } catch (e) {
      const error = e as Error;
      setErrorMessage(error?.message ?? t("failed"));
    }
  }, [apollo.cache, client, nftId, setErrorMessage, setIsConfirmed, signature]);

  // Handle the navigation pop back to the root
  const handlePressPrimary = useCallback(() => {
    if (isConfirmed) {
      navigation.popToTop();
      navigation.popToTop();
    }
  }, [isConfirmed, navigation]);

  const imageUrl = image ? externalResourceUri(image) : UNKNOWN_NFT_ICON_SRC;

  const subtitle =
    errorMessage ?? t("nft_send_pending", { name: name ?? "Item" });

  return (
    <YStack ai="center" f={1} gap={40} p={16}>
      <Image
        borderRadius={8}
        source={{ uri: imageUrl, height: IMAGE_SIZE, width: IMAGE_SIZE }}
      />
      <ConfirmationIcon confirmed={isConfirmed} hasError={!!errorMessage} />
      <ConfirmationSubtitle confirmed={isConfirmed} content={subtitle} />
      <ConfirmationButtons
        blockchain={blockchain}
        confirmed={isConfirmed}
        confirmedLabel={t("view_collectibles")}
        onConfirmedPress={handlePressPrimary}
        signature={signature}
      />
    </YStack>
  );
}
