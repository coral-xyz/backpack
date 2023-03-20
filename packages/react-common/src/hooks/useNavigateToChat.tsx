import {
  BACKEND_API_URL,
  NAV_COMPONENT_MESSAGE_GROUP_CHAT,
  TAB_MESSAGES,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
} from "@coral-xyz/common";
import { refreshGroups } from "@coral-xyz/db";
import {
  chatByCollectionId,
  chatByNftId,
  useActiveWallet,
  useBackgroundClient,
  useBlockchainConnectionUrl,
  useGroupCollections,
  useNavigation,
  useUser,
} from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

export const useNavigateToChat = ({
  nftId,
  metadataCollectionId,
}: {
  nftId: string;
  metadataCollectionId: string;
}) => {
  const activeWallet = useActiveWallet();
  const { uuid } = useUser();
  const groupCollections = useGroupCollections({ uuid });
  const whitelistedChatCollection = useRecoilValue(
    chatByCollectionId(metadataCollectionId)
  );
  const background = useBackgroundClient();
  const { push } = useNavigation();

  if (!whitelistedChatCollection) {
    return () => {};
  }

  return async () => {
    if (
      !groupCollections.find(
        (x) => x.collectionId === whitelistedChatCollection.collectionId
      ) &&
      !groupCollections.find(
        (x) => x.collectionId === whitelistedChatCollection.id
      )
    ) {
      await fetch(`${BACKEND_API_URL}/nft/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: activeWallet.publicKey,
          nfts: [
            {
              collectionId: whitelistedChatCollection?.collectionId,
              nftId,
              centralizedGroup: whitelistedChatCollection?.id,
            },
          ],
        }),
      });
      await refreshGroups(uuid);
    }

    await background.request({
      method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
      params: [TAB_MESSAGES],
    });
    push({
      title: whitelistedChatCollection?.name,
      componentId: NAV_COMPONENT_MESSAGE_GROUP_CHAT,
      componentProps: {
        fromInbox: true,
        id: whitelistedChatCollection?.id,
        title: whitelistedChatCollection?.name,
      },
    });
  };
};
