import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  Blockchain,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  wait,
} from "@coral-xyz/common";
import {
  GET_COLLECTIBLES_QUERY,
  type ProviderId,
  type ResponseCollectible,
} from "@coral-xyz/data-components";
import {
  blockchainClientAtom,
  secureUserAtom,
  useActiveWallet,
  useAvatarUrl,
  useBackgroundClient,
  useBlockchainExplorer,
  useDecodedSearchParams,
  useSolanaCtx,
} from "@coral-xyz/recoil";
import {
  explorerCompressedNftUrl,
  explorerNftUrl,
} from "@coral-xyz/secure-background/legacyCommon";
import { useTheme } from "@coral-xyz/tamagui";
import MoreHorizIcon from "@mui/icons-material/MoreHorizRounded";
import { IconButton } from "@mui/material";
import { BigNumber } from "ethers";
import { useRecoilValue } from "recoil";
import { useAsyncEffect } from "use-async-effect";

import { ApproveTransactionDrawer } from "../../common/ApproveTransactionDrawer";
import PopoverMenu from "../../common/PopoverMenu";
import {
  Error as ErrorConfirmation,
  Sending,
} from "../Balances/TokensWidget/Send";

export function CollectibleOptionsButton() {
  const theme = useTheme();
  const activeWallet = useActiveWallet();
  const explorer = useBlockchainExplorer(activeWallet.blockchain);
  const apollo = useApolloClient();
  const background = useBackgroundClient();
  const { props } = useDecodedSearchParams();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [burnt, setBurnt] = useState(false);

  useAsyncEffect(async () => {
    // If the modal is being closed and the NFT has been burnt then navigate
    // back to the nav root because the send screen is no longer valid as the
    // wallet no longer possesses the NFT.
    if (!openDrawer && burnt) {
      await background.request({
        method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
        params: [],
      });
    }
  }, [background, burnt, openDrawer]);

  const { data: nft, connectionUrl } =
    (props as {
      connectionUrl: string;
      data: ResponseCollectible;
    }) ?? {};

  if (!nft) {
    return null;
  }

  const onClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        disableRipple
        style={{ padding: 0 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreHorizIcon style={{ color: theme.baseIcon.val }} />
      </IconButton>
      <PopoverMenu.Root
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        onClose={onClose}
        open={Boolean(anchorEl)}
      >
        <PopoverMenu.Group>
          <PopoverMenu.Item
            onClick={() => {
              const url = nft.compressed
                ? explorerCompressedNftUrl(nft.address)
                : explorerNftUrl(explorer, nft.address, connectionUrl);
              window.open(url, "_blank");
            }}
          >
            View on Explorer
          </PopoverMenu.Item>
          {/* <PopoverMenu.Item disabled={nft.compressed} onClick={onSetPfp}>
            Set as PFP
          </PopoverMenu.Item> */}
        </PopoverMenu.Group>
        <PopoverMenu.Group>
          <PopoverMenu.Item
            disabled={activeWallet.blockchain !== Blockchain.SOLANA}
            onClick={() => {
              onClose();
              setOpenDrawer(true);
            }}
            sx={{ color: `${theme.redText.val} !important` }}
          >
            Burn Token
          </PopoverMenu.Item>
        </PopoverMenu.Group>
      </PopoverMenu.Root>
      <ApproveTransactionDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      >
        <BurnConfirmationCard
          nft={{
            id: nft.id,
            compressed: nft.compressed,
            compressionData: nft.compressionData,
            decimals: 0,
            imageUrl: nft.image ?? "",
            mint: nft.address,
            publicKey: nft.token ?? "",
          }}
          onComplete={async () => {
            await wait(2);
            await apollo.query({
              query: GET_COLLECTIBLES_QUERY,
              fetchPolicy: "network-only",
              variables: {
                address: activeWallet.publicKey,
                providerId: activeWallet.blockchain.toUpperCase() as ProviderId,
              },
            });
            setBurnt(true);
          }}
        />
      </ApproveTransactionDrawer>
    </>
  );
}

function BurnConfirmationCard({
  nft,
  onComplete,
  onClose,
}: {
  nft: any;
  onClose?: () => void;
  onComplete?: () => void;
}) {
  const blockchain = Blockchain.SOLANA;
  const blockchainClient = useRecoilValue(blockchainClientAtom(blockchain));
  const user = useRecoilValue(secureUserAtom);
  const avatar = useAvatarUrl(120, user.user.username);
  const [state, setState] = useState<
    "confirm" | "sending" | "confirming" | "confirmed" | "error"
  >("confirm");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const solanaCtx = useSolanaCtx();

  const token = {
    logo: nft ? nft.imageUrl : "",
    mint: nft ? nft.mint : "",
    decimals: 0,
  };

  const onConfirm = async () => {
    try {
      setState("sending");
      const publicKey = solanaCtx.walletPublicKey.toBase58();

      const _signature = await blockchainClient!.burnAsset({
        assetId: nft.id as string,
        from: {
          publicKey,
          username: user.user.username,
          image: avatar,
          walletName:
            user.publicKeys.platforms.solana?.publicKeys[publicKey]?.name,
        },
      });

      setSignature(_signature);
      setState("confirming");

      //
      // Confirm the tx.
      //
      await blockchainClient!.confirmTransaction(_signature);

      onComplete?.();
      setState("confirmed");
    } catch (err: any) {
      console.log("error burning NFT", err);
      setError(err);
      setState("error");
    }
  };

  useEffect(() => {
    if (solanaCtx) {
      onConfirm().catch((e) => console.error(e));
    }
  }, [!!solanaCtx]);

  useEffect(() => {
    if (error?.message.includes("Approval Denied")) {
      onClose?.();
    }
  }, [error]);

  return ["sending", "confirming", "confirm"].includes(state) ? (
    <Sending
      blockchain={blockchain}
      isComplete={false}
      amount={BigNumber.from(1)}
      token={token}
      signature={signature ?? undefined}
      titleOverride="Burning"
    />
  ) : state === "confirmed" ? (
    <Sending
      blockchain={blockchain}
      isComplete
      amount={BigNumber.from(1)}
      token={token}
      signature={signature!}
      titleOverride="Burnt"
    />
  ) : error ? (
    <ErrorConfirmation
      blockchain={blockchain}
      signature={signature!}
      error={error.message ?? error.toString() ?? null}
      onRetry={() => onConfirm()}
    />
  ) : null;
}
