import { useEffect, useState } from "react";
import { gql, useFragment } from "@apollo/client";
import type { ResponseCollectible } from "@coral-xyz/data-components";
import { blockchainClientAtom, useActiveWallet } from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import {
  AddressSelector,
  type SendData,
} from "../../../../components/Unlocked/Balances/TokensWidget/AddressSelector";
import { ScreenContainer } from "../../../components/ScreenContainer";
import {
  ConfirmationErrorDrawer,
  withTransactionCancelBypass,
} from "../../../components/TransactionConfirmation";
import {
  Routes,
  type SendCollectibleAddressSelectScreenProps,
} from "../../../navigation/SendCollectibleNavigator";
import { Loading } from "../Send/SendAddressSelectScreen";

export function SendCollectibleAddressSelectScreen(
  props: SendCollectibleAddressSelectScreenProps
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

type _NftAddressSelectFragment = Pick<
  ResponseCollectible,
  | "address"
  | "compressed"
  | "compressionData"
  | "image"
  | "name"
  | "token"
  | "type"
>;

function Container({
  navigation,
  route,
}: SendCollectibleAddressSelectScreenProps) {
  const { nftId } = route.params;

  const { data } = useFragment<_NftAddressSelectFragment>({
    fragmentName: "NftAddressSelectFragment",
    from: {
      __typename: "Nft",
      id: nftId,
    },
    fragment: gql`
      fragment NftAddressSelectFragment on Nft {
        image
        name
      }
    `,
  });

  const { blockchain, publicKey } = useActiveWallet();
  const blockchainClient = useRecoilValue(blockchainClientAtom(blockchain));
  const [error, setError] = useState<string | undefined>(undefined);
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    blockchainClient.prefetchAsset(nftId);
  }, [blockchainClient, nftId]);

  const handleAddressSelect = async (to: SendData) => {
    if (!data) {
      return;
    }

    try {
      await withTransactionCancelBypass(async () => {
        const txSignature = await blockchainClient.transferAsset({
          amount: "1",
          assetId: nftId,
          from: { publicKey },
          to: { ...to, publicKey: to.address },
        });

        navigation.push(Routes.SendCollectibleConfirmationScreen, {
          image: data.image ?? undefined,
          name: data.name ?? undefined,
          nftId,
          signature: txSignature,
        });
      });
    } catch (err: any) {
      setError(err.message);
      setOpenDrawer(true);
    }
  };

  return (
    <>
      <AddressSelector blockchain={blockchain} onSelect={handleAddressSelect} />
      <ConfirmationErrorDrawer
        error={error}
        open={openDrawer}
        resetError={() => setError(undefined)}
        setOpen={setOpenDrawer}
      />
    </>
  );
}
