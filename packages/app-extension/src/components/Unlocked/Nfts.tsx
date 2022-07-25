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
      <CollectionGrid />
    </div>
  );
}

function CollectionGrid() {
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
        <NftCollection name={c.name} collection={c.items} />
      ))}
    </div>
  );
}

function NftCollection({
  name,
  collection,
}: {
  name: string;
  collection: any;
}) {
  const theme = useCustomTheme();
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
        src={display.tokenMetaUriData.image}
      />
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
          {name}{" "}
          <span
            style={{
              color: theme.custom.colors.secondary,
            }}
          >
            {collection.length}
          </span>
        </Typography>
      </div>
    </Button>
  );
}
