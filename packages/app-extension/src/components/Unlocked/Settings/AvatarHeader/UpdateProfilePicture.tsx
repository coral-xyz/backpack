import React, { useEffect, useMemo, useState } from "react";
import type { Nft, NftCollection } from "@coral-xyz/common";
import {
  AVATAR_BASE_URL,
  BACKEND_API_URL,
  Blockchain,
} from "@coral-xyz/common";
import {
  EmptyState,
  ImageIcon,
  Loading,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  isAggregateWallets,
  newAvatarAtom,
  nftById,
  nftCollectionsWithIds,
  useActiveWallet,
  useActiveWallets,
  useAvatarUrl,
  useEthereumConnectionUrl,
  useSolanaConnectionUrl,
  useUser,
} from "@coral-xyz/recoil";
import type { CustomTheme } from "@coral-xyz/themes";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import DeleteIcon from "@mui/icons-material/Delete";
import { CircularProgress, Grid, IconButton } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";

import { Scrollbar } from "../../../common/Layout/Scrollbar";
import { _BalancesTableHead } from "../../Balances/Balances";

type tempAvatar = {
  nft?: Nft;
  url: string;
  id: string;
};

export function UpdateProfilePicture({
  setOpenDrawer,
}: {
  setOpenDrawer: (open: boolean) => void;
}) {
  const [tempAvatar, setTempAvatar] = useState<tempAvatar | null>(null);
  const [loading, setLoading] = useState(false);
  const _isAggregateWallets = useRecoilValue(isAggregateWallets);
  const avatarUrl = useAvatarUrl();
  const { username } = useUser();
  const activeWallet = useActiveWallet();
  const setNewAvatar = useSetRecoilState(newAvatarAtom(username));
  const theme = useCustomTheme();
  const { contents, state } = useRecoilValueLoadable(nftCollectionsWithIds);
  const [isDefaultAvatar, setIsDefaultAvatar] = useState(true);

  useEffect(() => {
    if (!avatarUrl || avatarUrl === "" || !username || username === "") return;

    Promise.all([
      fetch(avatarUrl).then((res) => res.text()),
      fetch(`https://avatars.xnfts.dev/v1/${username}?size=500`).then((res) =>
        res.text()
      ),
    ])
      .then((avatars) => {
        if (avatars[0] !== avatars[1]) {
          setIsDefaultAvatar(false);
        }
      })
      .catch(console.error);
  }, [avatarUrl, username]);

  const allWalletCollections: Array<{
    publicKey: string;
    collections: Array<NftCollection>;
  }> = (state === "hasValue" && contents) || [];

  const numberOfNFTs = allWalletCollections.reduce(
    (acc, c) => acc + (c.collections ?? []).length,
    0
  );

  return (
    <Container>
      <div
        style={{ display: "flex", justifyContent: "center", padding: "5px" }}
      >
        <div style={{ position: "relative", width: "max-content" }}>
          <AvatarWrapper>
            <Avatar src={tempAvatar?.url || avatarUrl} />
          </AvatarWrapper>
          {!isDefaultAvatar ? (
            <IconButton
              disableRipple
              sx={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                color: theme.custom.colors.icon,
              }}
              onClick={() =>
                setTempAvatar({
                  id: "",
                  url: `https://avatars.xnfts.dev/v1/${username}`,
                })
              }
            >
              <DeleteIcon />
            </IconButton>
          ) : null}
        </div>
      </div>
      <Typography
        style={{
          textAlign: "center",
          color: theme.custom.colors.fontColor,
        }}
      >{`@${username}`}</Typography>
      <FakeDrawer>
        <Scrollbar
          style={{
            height: "100%",
            background: theme.custom.colors.nav,
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
            }}
          >
            {state === "loading" ? (
              <Loading size={50} />
            ) : numberOfNFTs === 0 ? (
              <>
                {!_isAggregateWallets ? (
                  <div
                    style={{ position: "absolute", top: 0, left: 0, right: 0 }}
                  >
                    <_BalancesTableHead
                      blockchain={activeWallet.blockchain}
                      showContent
                      setShowContent={() => {}}
                    />
                  </div>
                ) : null}
                <EmptyState
                  icon={(props: any) => <ImageIcon {...props} />}
                  title="No NFTs to use"
                  subtitle="Get started with your first NFT"
                  onClick={() => window.open("https://magiceden.io/")}
                  contentStyle={{
                    marginBottom: 0,
                    color: "inherit",
                    border: "none",
                  }}
                  innerStyle={{
                    border: "none",
                  }}
                  buttonText="Browse Magic Eden"
                />
              </>
            ) : (
              <div
                style={{
                  paddingBottom: tempAvatar ? "80px" : "0px",
                  transition: "padding ease-out 200ms",
                }}
              >
                {allWalletCollections.map(
                  (c: {
                    publicKey: string;
                    collections: Array<NftCollection>;
                  }) => (
                    <BlockchainNFTs
                      key={c.publicKey}
                      publicKey={c.publicKey}
                      collections={c.collections}
                      isLoading={false}
                      tempAvatar={tempAvatar}
                      setTempAvatar={setTempAvatar}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </Scrollbar>
      </FakeDrawer>
      <ButtonsOverlay
        style={{
          maxHeight: tempAvatar ? "100px" : "0px",
        }}
      >
        <SecondaryButton
          label="Cancel"
          onClick={() => {
            setTempAvatar(null);
          }}
          style={{
            margin: "16px",
          }}
        />
        <PrimaryButton
          label={
            loading ? (
              <CircularProgress
                size={24}
                sx={{ color: "white", display: "flex", alignSelf: "center" }}
              />
            ) : (
              "Update"
            )
          }
          onClick={async () => {
            if (tempAvatar) {
              if (!tempAvatar.nft) {
                throw new Error("invariant violation");
              }
              setLoading(true);
              await fetch(BACKEND_API_URL + "/users/avatar", {
                headers: {
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                  avatar: tempAvatar.id === "" ? null : tempAvatar.id,
                }),
              });
              await fetch(AVATAR_BASE_URL + "/" + username + "?bust_cache=1"); // bust edge cache

              //  Need SWR mechanic for Local pfps before enabling again so we can update PFPs from xnfts.
              // await updateLocalNftPfp(uuid, username, tempAvatar.nft!);
              setLoading(false);
              setNewAvatar(tempAvatar);
              setTempAvatar(null);
              setOpenDrawer(false);
            }
          }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "16px",
            marginLeft: "0px",
          }}
        />
      </ButtonsOverlay>
    </Container>
  );
}

const BlockchainNFTs = React.memo(function BlockchainNFTs({
  publicKey,
  collections,
  isLoading,
  tempAvatar,
  setTempAvatar,
}: {
  publicKey: string;
  collections: Array<NftCollection>;
  isLoading: boolean;
  tempAvatar: tempAvatar | null;
  setTempAvatar: (tempAvatar: tempAvatar) => void;
}) {
  const [showContent, setShowContent] = useState(true);
  const wallets = useActiveWallets();
  const wallet = wallets.find((wallet) => wallet.publicKey === publicKey)!;
  const blockchain = wallet.blockchain;
  const solanaUrl = useSolanaConnectionUrl() ?? ""; // eslint dont move this line
  const ethereumUrl = useEthereumConnectionUrl() ?? ""; // eslint dont move this line
  const connectionUrl =
    blockchain === Blockchain.SOLANA ? solanaUrl : ethereumUrl;

  const nftsIds = collections.reduce<string[]>((flat, collection) => {
    flat.push(...collection.itemIds);
    return flat;
  }, []);

  if (!isLoading && collections.length === 0) {
    return null;
  }

  return (
    <>
      <_BalancesTableHead
        blockchain={blockchain}
        showContent={showContent}
        setShowContent={setShowContent}
      />
      <Collapse in={showContent}>
        <Grid
          container
          style={{ padding: "12px 16px 16px 16px" }}
          spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}
        >
          {nftsIds.map((nftId) => (
            <RenderNFT
              key={nftId}
              publicKey={publicKey}
              connectionUrl={connectionUrl}
              nftId={nftId}
              tempAvatar={tempAvatar}
              setTempAvatar={setTempAvatar}
            />
          ))}
        </Grid>
      </Collapse>
    </>
  );
});

function RenderNFT({
  publicKey,
  connectionUrl,
  nftId,
  tempAvatar,
  setTempAvatar,
}: {
  publicKey: string;
  connectionUrl: string;
  nftId: string;
  setTempAvatar: (tempAvatar: tempAvatar) => void;
  tempAvatar: tempAvatar | null;
}) {
  const { contents, state } = useRecoilValueLoadable(
    nftById({ publicKey, connectionUrl, nftId })
  );
  const nft = (state === "hasValue" && contents) || null;

  return useMemo(
    () =>
      !nft ? null : (
        <StyledProxyImage
          key={nftId}
          onClick={() => {
            const avatarId =
              nft.blockchain === "solana"
                ? // @ts-ignore
                  nft.mint
                : nft.id;

            setTempAvatar({
              nft,
              url: nft.imageUrl,
              id: `${nft.blockchain}/${avatarId}`,
            });
          }}
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "40px",
            margin: "16px 0px 0px 16px",
            border: tempAvatar?.url === nft.imageUrl ? "3px solid black" : "",
          }}
          src={nft.imageUrl}
          removeOnError
        />
      ),
    [nft, nftId, tempAvatar]
  );
}

const Container = styled("div")(() => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
}));

const StyledProxyImage = styled(ProxyImage)(
  ({ theme }: { theme: CustomTheme }) => ({
    "&:hover": {
      border: `3px solid ${theme.custom.colors.avatarIconBackground}`,
      cursor: "pointer",
    },
  })
);

const FakeDrawer = styled("div")(({ theme }: { theme: CustomTheme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  backgroundColor: theme.custom.colors.nav,
  flex: 1,
  borderTop: `${theme.custom.colors.borderFull}`,
  paddingBottom: "0px",
  paddingTop: "0px",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
  marginTop: "16px",
  zIndex: "0",
  overflow: "hidden",
}));
const ButtonsOverlay = styled("div")(({ theme }: { theme: CustomTheme }) => ({
  position: "absolute",
  bottom: "0px",
  display: "flex",
  zIndex: "1",
  background: theme.custom.colors.nav,
  alignItems: "stretch",
  width: "100%",
  transition: "max-height ease-out 200ms",
}));

const Avatar = styled(ProxyImage)(() => ({
  borderRadius: "40px",
  width: "64px",
  height: "64px",
  marginLeft: "auto",
  marginRight: "auto",
  display: "block",
  zIndex: 0,
}));

const AvatarWrapper = styled("div")(({ theme }: { theme: CustomTheme }) => ({
  boxSizing: "border-box",
  position: "relative",
  borderRadius: "50px",
  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='100' ry='100' stroke='${encodeURIComponent(
    theme.custom.colors.avatarIconBackground
  )}' stroke-width='5' stroke-dasharray='8%25%2c 13%25' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
  padding: "6px",
  width: "82px",
  height: "82px",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "&:hover .editOverlay": {
    visibility: "visible",
  },
}));
