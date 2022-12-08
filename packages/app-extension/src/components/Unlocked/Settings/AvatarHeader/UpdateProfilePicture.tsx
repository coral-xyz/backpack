import { useState } from "react";
import type { Blockchain, Nft, NftCollection } from "@coral-xyz/common";
import { toTitleCase, walletAddressDisplay } from "@coral-xyz/common";
import {
  nftCollections,
  useActiveWallets,
  useAvatarUrl,
  useBlockchainLogo,
  useUser,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import { ExpandLess, ExpandMore, Image } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CardHeader,
  Grid,
  Skeleton,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { useRecoilValueLoadable } from "recoil";

import { Scrollbar } from "../../../common/Layout/Scrollbar";
import { ProxyImage } from "../../../common/ProxyImage";
import { BalancesTable, BalancesTableHead } from "../../Balances";
import { NftTable } from "../../Nfts";

export function UpdateProfilePicture() {
  const avatarUrl = useAvatarUrl(64);
  const { username } = useUser();
  // const wallets = useActiveWallets();
  const wallets = useWalletPublicKeys();
  const collections = useRecoilValueLoadable(nftCollections);
  console.log("wallets", wallets, collections);
  return (
    <Container>
      <div style={{ marginTop: "16px", marginBottom: "16px" }}>
        <AvatarWrapper>
          <Avatar src={avatarUrl} />
        </AvatarWrapper>
        <Typography style={{ textAlign: "center" }}>
          {`@${username}`}
        </Typography>
      </div>
      <FakeDrawer>
        <Scrollbar style={{ height: "100%" }}>
          {collections.state === "hasValue" &&
            Object.entries(collections.contents).map(
              ([blockchain, collection]) => (
                <BlockchainNFTs
                  key={blockchain}
                  blockchain={blockchain as Blockchain}
                  collections={collection as NftCollection[]}
                  isLoading={collections.state !== "hasValue"}
                />
              )
            )}
        </Scrollbar>
      </FakeDrawer>
    </Container>
  );
}

function BlockchainNFTs({
  blockchain,
  collections,
  isLoading,
}: {
  blockchain: Blockchain;
  collections: NftCollection[];
  isLoading: boolean;
}) {
  const [showContent, setShowContent] = useState(true);

  const nfts = collections.reduce<Nft[]>((flat, collection) => {
    flat.push(...collection.items);
    return flat;
  }, []);

  if (!isLoading && collections.length === 0) {
    return null;
  }

  console.log(blockchain, nfts);
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
              <Grid item xs={3} sm={3} md={3} lg={3} key={index}>
                <ProxyImage
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "40px",
                  }}
                  src={nft.imageUrl}
                />
              </Grid>
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
}));

const Avatar = styled("img")(({ theme }) => ({
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
  border: `2px dashed ${theme.custom.colors.avatarIconBackground}`,
  padding: "6px",
  width: "80px",
  height: "80px",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "hidden",
  display: "block",
  "&:hover .editOverlay": {
    visibility: "visible",
  },
}));
