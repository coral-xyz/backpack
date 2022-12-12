import { useState } from "react";
import type { Blockchain, Nft, NftCollection } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  toTitleCase,
  // UI_RPC_METHOD_USER_AVATAR_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  nftCollections,
  useActiveWallets,
  useAvatarUrl,
  useBackgroundClient,
  useBlockchainLogo,
  useUser,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { CardHeader, Grid } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { useRecoilValueLoadable } from "recoil";

import { PrimaryButton, SecondaryButton } from "../../../common";
import { Scrollbar } from "../../../common/Layout/Scrollbar";
import { ProxyImage } from "../../../common/ProxyImage";

type NewAvatar = {
  url: string;
  id: string;
};
export function UpdateProfilePicture({
  setOpenDrawer,
}: {
  setOpenDrawer: (open: boolean) => void;
}) {
  const background = useBackgroundClient();
  const [newAvatar, setNewAvatar] = useState<NewAvatar | null>(null);
  const avatarUrl = useAvatarUrl(64);
  const { username } = useUser();
  // const wallets = useActiveWallets();
  const wallets = useWalletPublicKeys();
  const collections = useRecoilValueLoadable(nftCollections);
  console.log("wallets", wallets, collections, newAvatar);
  return (
    <Container>
      <AvatarWrapper>
        <Avatar src={newAvatar?.url || avatarUrl} />
      </AvatarWrapper>
      <Typography style={{ textAlign: "center" }}>{`@${username}`}</Typography>
      <FakeDrawer>
        <Scrollbar
          style={{
            height: "100%",
          }}
        >
          <div
            style={{
              paddingBottom: newAvatar ? "80px" : "0px",
              transition: "padding ease-out 200ms",
            }}
          >
            {collections.state === "hasValue" &&
              Object.entries(collections.contents).map(
                ([blockchain, collection]) => (
                  <BlockchainNFTs
                    key={blockchain}
                    blockchain={blockchain as Blockchain}
                    collections={collection as NftCollection[]}
                    isLoading={collections.state !== "hasValue"}
                    newAvatar={newAvatar}
                    setNewAvatar={setNewAvatar}
                  />
                )
              )}
          </div>
        </Scrollbar>
      </FakeDrawer>
      <ButtonsOverlay
        style={{
          maxHeight: newAvatar ? "100px" : "0px",
        }}
      >
        <SecondaryButton
          label={"Cancel"}
          onClick={() => {
            console.log(newAvatar);
            setNewAvatar(null);
            setOpenDrawer(false);
          }}
          style={{
            margin: "16px",
          }}
        />
        <PrimaryButton
          label={"Update"}
          onClick={async () => {
            if (newAvatar) {
              await fetch(BACKEND_API_URL + "/users/avatar", {
                headers: {
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ avatar: newAvatar.id }),
              });
              setNewAvatar(null);
            }
          }}
          style={{
            margin: "16px",
            marginLeft: "0px",
          }}
        />
      </ButtonsOverlay>
    </Container>
  );
}

function BlockchainNFTs({
  blockchain,
  collections,
  isLoading,
  newAvatar,
  setNewAvatar,
}: {
  blockchain: Blockchain;
  collections: NftCollection[];
  isLoading: boolean;
  newAvatar: NewAvatar | null;
  setNewAvatar: (newAvatar: NewAvatar) => void;
}) {
  const [showContent, setShowContent] = useState(true);

  const nfts = collections.reduce<Nft[]>((flat, collection) => {
    flat.push(...collection.items);
    return flat;
  }, []);

  if (!isLoading && collections.length === 0) {
    return null;
  }

  return (
    <>
      <BlockchainHeader
        setShowContent={setShowContent}
        showContent={showContent}
        blockchain={blockchain}
      />
      <Collapse in={showContent}>
        <Grid
          container
          style={{ padding: "0px 16px 16px 16px" }}
          spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}
        >
          {nfts.map((nft, index) => {
            return (
              <StyledProxyImage
                key={index}
                onClick={() => {
                  console.log(nft);
                  setNewAvatar({
                    url: nft.imageUrl,
                    id: `${nft.blockchain}/${nft.id}`,
                  });
                }}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "40px",
                  margin: "16px 0px 0px 16px",
                  border:
                    newAvatar?.url === nft.imageUrl ? "3px solid black" : "",
                }}
                src={nft.imageUrl}
                removeOnError={true}
              />
            );
          })}
        </Grid>
      </Collapse>
    </>
  );
}

function BlockchainHeader({
  setShowContent,
  showContent,
  blockchain,
}: {
  setShowContent: (showContent: boolean) => void;
  showContent: boolean;
  blockchain: Blockchain;
}) {
  const blockchainLogo = useBlockchainLogo(blockchain);
  const title = toTitleCase(blockchain);
  const theme = useCustomTheme();
  const wallets = useActiveWallets();
  const wallet = wallets.find((wallet) => wallet.blockchain === blockchain);

  return (
    <CardHeader
      onClick={() => setShowContent(!showContent)}
      style={{
        padding: "8px 16px",
        cursor: "pointer",
      }}
      avatar={
        blockchainLogo && (
          <ProxyImage
            src={blockchainLogo}
            style={{
              width: "12px",
              borderRadius: "2px",
              color: theme.custom.colors.secondary,
            }}
          />
        )
      }
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <Typography
              style={{
                fontWeight: 500,
                lineHeight: "24px",
                fontSize: "14px",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {title}
            </Typography>
            {wallet && (
              <Typography
                style={{
                  fontWeight: 500,
                  lineHeight: "24px",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  marginLeft: "8px",
                }}
              >
                {walletAddressDisplay(wallet.publicKey)}
              </Typography>
            )}
          </div>
          {showContent ? (
            <ExpandLess sx={{ width: "18px" }} />
          ) : (
            <ExpandMore sx={{ width: "18px" }} />
          )}
        </div>
      }
    />
  );
}

const Container = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
}));

const StyledProxyImage = styled(ProxyImage)(({ theme }) => ({
  "&:hover": {
    border: `3px solid ${theme.custom.colors.avatarIconBackground}`,
    cursor: "pointer",
  },
}));

const FakeDrawer = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  backgroundColor: theme.custom.colors.bg3,
  flex: 1,
  borderTop: `${theme.custom.colors.borderFull}`,
  paddingBottom: "0px",
  paddingTop: "0px",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
  marginTop: "16px",
  zIndex: "0",
}));
const ButtonsOverlay = styled("div")(({ theme }) => ({
  position: "absolute",
  bottom: "0px",
  display: "flex",
  zIndex: "1",
  background: "rgba(255,255,255, 0.8)",
  alignItems: "stretch",
  width: "100%",
  transition: "max-height ease-out 200ms",
}));

const Avatar = styled(ProxyImage)(({ theme }) => ({
  borderRadius: "40px",
  width: "64px",
  height: "64px",
  marginLeft: "auto",
  marginRight: "auto",
  display: "block",
  zIndex: 0,
}));

const AvatarWrapper = styled("div")(({ theme }) => ({
  boxSizing: "border-box",
  position: "relative",
  borderRadius: "40px",
  border: `3px dashed ${theme.custom.colors.avatarIconBackground}`,
  padding: "6px",
  width: "82px",
  height: "82px",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "hidden",
  display: "block",
  "&:hover .editOverlay": {
    visibility: "visible",
  },
}));
