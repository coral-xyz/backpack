import { Button, Typography } from "@mui/material";
import {
  NAV_COMPONENT_NFT_DETAIL,
  NAV_COMPONENT_NFT_COLLECTION,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNavigation, useNftCollections } from "@coral-xyz/recoil";

export function Nfts() {
  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <NftGrid />
    </div>
  );
}

function NftGrid() {
  const collections = useNftCollections();
  return (
    <div
      style={{
        flexWrap: "wrap",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {[...collections.entries()].map(([name, c]: any) => (
        <NftCollectionCard name={c.name} collection={c.items} />
      ))}
    </div>
  );
}

function NftCollectionCard({
  name,
  collection,
}: {
  name: string;
  collection: any;
}) {
  const display = collection[0];
  const { push } = useNavigation();

  const onClick = () => {
    if (collection.length === 1) {
      if (!display.tokenMetaUriData.name || !display.publicKey) {
        throw new Error("invalid nft data");
      }
      push({
        title: display.tokenMetaUriData.name,
        componentId: NAV_COMPONENT_NFT_DETAIL,
        componentProps: {
          publicKey: display.publicKey,
        },
      });
    } else {
      push({
        title: name,
        componentId: NAV_COMPONENT_NFT_COLLECTION,
        componentProps: {
          name,
        },
      });
    }
  };

  return (
    <GridCard
      onClick={onClick}
      nft={display}
      subtitle={{ name, length: collection.length }}
    />
  );
}

export function GridCard({ onClick, nft, subtitle }: any) {
  const theme = useCustomTheme();
  return (
    <Button
      onClick={onClick}
      disableRipple
      style={{
        marginTop: "16px",
        textTransform: "none",
        padding: 0,
        borderRadius: "8px",
        position: "relative",
        height: "164px",
        overflow: "hidden",
      }}
    >
      <img
        style={{
          width: "164px",
        }}
        src={nft.tokenMetaUriData.image}
      />
      {subtitle && (
        <div
          style={{
            backgroundColor: theme.custom.colors.nav,
            position: "absolute",
            left: 8,
            bottom: 8,
            zIndex: 2,
            height: "24px",
            borderRadius: "12px",
            paddingLeft: "8px",
            paddingRight: "8px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            style={{
              fontSize: "12px",
              color: theme.custom.colors.fontColor,
            }}
          >
            {subtitle.name}{" "}
            <span
              style={{
                color: theme.custom.colors.secondary,
              }}
            >
              {subtitle.length}
            </span>
          </Typography>
        </div>
      )}
    </Button>
  );
}
