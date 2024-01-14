import { useState } from "react";
import { gql, useFragment } from "@apollo/client";
import { Blockchain } from "@coral-xyz/common";
import type { ResponseCollectible } from "@coral-xyz/data-components";
import {
  blockchainClientAtom,
  useActiveWallet,
  useAssetKindAndData,
  useSolanaTokenMint,
} from "@coral-xyz/recoil";
import { BigNumber } from "ethers";
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
        address
        compressed
        compressionData {
          creatorHash
          dataHash
          leaf
          tree
        }
        image
        name
        token
        type
      }
    `,
  });

  const { blockchain, publicKey } = useActiveWallet();
  const blockchainClient = useRecoilValue(blockchainClientAtom(blockchain));
  const [error, setError] = useState<string | undefined>(undefined);
  const [openDrawer, setOpenDrawer] = useState(false);

  const mintInfo = useSolanaTokenMint({
    publicKey,
    tokenAddress: data?.token ?? publicKey,
  });

  const kindAndDataPromise = useAssetKindAndData(
    { blockchain, publicKey },
    {
      address: data.address ?? "",
      compressed: data.compressed ?? false,
      compressionData: data.compressionData
        ? {
            tree: data.compressionData.tree ?? undefined,
          }
        : undefined,
    }
  );

  const handleAddressSelect = async (to: SendData) => {
    if (!data) {
      return;
    }

    try {
      await withTransactionCancelBypass(async () => {
        // FIXME: clean up to be chain agnostic (requires changs to secure clients)
        const assetData =
          blockchain === Blockchain.ETHEREUM
            ? {
                id: nftId,
                mint: data.address?.split("/")[0],
                tokenId: data.token,
                tokenType: data.type,
              }
            : blockchain === Blockchain.SOLANA
            ? {
                token: {
                  id: nftId,
                  compressed: data.compressed,
                  compressionData: data.compressionData,
                  decimals: 0,
                  mint: data.address,
                  token: data.token,
                },
                mintInfo,
              }
            : {};

        const assetId = JSON.stringify(assetData, (_key, value) => {
          if (typeof value === "bigint" || value instanceof BigNumber) {
            return value.toString();
          }
          return value;
        });

        const { kind, data: cnftData } = (await kindAndDataPromise) ?? {};

        const txSignature = await blockchainClient.transferAsset({
          amount: "1",
          assetId,
          kind,
          data: cnftData,
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
