import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNftMetadata, useNavigation } from "@coral-xyz/recoil";
import { PrimaryButton, List, ListItem } from "../../common";

export function NftsDetail({ publicKey }: { publicKey: string }) {
  const theme = useCustomTheme();
  const nav = useNavigation();
  const nfts = useNftMetadata();
  const nft = nfts.get(publicKey);

  // Hack: needed because this is undefined due to framer-motion animation.
  if (!publicKey) {
    return <></>;
  }

  console.log("NFT HERE", nft);
  const send = () => {};

  return (
    <div
      style={{
        marginTop: "4px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <img
        style={{
          width: "100%",
          height: "343px",
          borderRadius: "8px",
        }}
        src={nft.tokenMetaUriData.image}
      />
      <Typography
        style={{
          marginTop: "20px",
          marginBottom: "4px",
          color: theme.custom.colors.secondary,
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
        }}
      >
        Description
      </Typography>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "16px",
        }}
      >
        {nft.tokenMetaUriData.description}
      </Typography>
      <PrimaryButton
        style={{
          marginBottom: "24px",
          marginTop: "24px",
        }}
        onClick={() => send()}
        label={"Send"}
      />
      <NftInfo nft={nft} />
    </div>
  );
}

function NftInfo({ nft }: any) {
  const [value, setValue] = useState(0);
  return (
    <Box>
      <Tabs
        style={{
          height: "34px",
        }}
        value={value}
        onChange={(e, newValue) => setValue(newValue)}
      >
        <Tab
          disableRipple
          label={
            <Typography style={{ textTransform: "none" }}>
              Attributes
            </Typography>
          }
        />
        <Tab
          disableRipple
          label={
            <Typography style={{ textTransform: "none" }}>Details</Typography>
          }
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        <Attributes nft={nft} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Details nft={nft} />
      </TabPanel>
    </Box>
  );
}

function TabPanel({ children, value, index }: any) {
  return (
    <div hidden={value !== index} id={`simple-tabpanel-${index}`}>
      {value === index && <div>{children}</div>}
    </div>
  );
}

function Attributes({ nft }: { nft: any }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        minHeight: "281px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: "12px",
          marginLeft: "-4px",
          marginRight: "-4px",
        }}
      >
        {nft.tokenMetaUriData.attributes.map((attr: any) => {
          return (
            <div
              style={{
                padding: "4px",
              }}
            >
              <div
                style={{
                  borderRadius: "8px",
                  backgroundColor: theme.custom.colors.nav,
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                }}
              >
                <Typography
                  style={{
                    color: theme.custom.colors.secondary,
                    fontSize: "14px",
                  }}
                >
                  {attr.trait_type}
                </Typography>
                <Typography
                  style={{
                    color: theme.custom.colors.fontColor,
                    fontSize: "16px",
                  }}
                >
                  {attr.value}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Details({ nft }: { nft: any }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        marginTop: "12px",
        minHeight: "281px",
      }}
    >
      <List
        style={{
          backgroundColor: theme.custom.colors.nav,
          marginLeft: 0,
          marginRight: 0,
        }}
      >
        <DetailListItem
          title={"Website"}
          value={nft.tokenMetaUriData.external_url}
        />
        <DetailListItem
          title={"Artist royalties"}
          value={`${(
            nft.metadata.data.sellerFeeBasisPoints / 100
          ).toString()}%`}
        />
        <DetailListItem
          title={"Mint address"}
          value={nft.metadata.mint.toString()}
        />
        <DetailListItem
          title={"Token address"}
          value={nft.publicKey.toString()}
        />
        <DetailListItem
          title={"Metadata address"}
          value={nft.metadataAddress.toString()}
        />
        <DetailListItem
          title={"Update authority"}
          value={nft.metadata.updateAuthority.toString()}
          isLast
        />
      </List>
    </div>
  );
}

function DetailListItem({
  title,
  value,
  isLast,
}: {
  title: string;
  value: any;
  isLast?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <ListItem
      isLast={isLast}
      disableRipple
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        padding: "12px",
        height: "44px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontSize: "14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {title}
        </Typography>
        <Typography
          style={{
            color: theme.custom.colors.secondary,
            fontSize: "14px",
            flexDirection: "column",
            justifyContent: "center",
            textOverflow: "ellipsis",
            width: "138px",
            overflow: "hidden",
            display: "block",
            textAlign: "right",
          }}
        >
          {value}
        </Typography>
      </div>
    </ListItem>
  );
}
