import { Button, Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useNftCollections } from "@coral-xyz/recoil";

const useStyles = styles((theme) => ({
  nftImage: {
    width: "187px",
  },
}));

export function Nfts() {
  return (
    <div
      style={{
        marginTop: "24px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <BalancesHeader />
      <CollectionGrid />
    </div>
  );
}

function BalancesHeader() {
  const theme = useCustomTheme();
  // TODO
  return (
    <div
      style={
        {
          //			borderBottom: `solid 1pt ${theme.custom.colors.border}`,
        }
      }
    ></div>
  );
}

export function CollectionGrid() {
  //  const nftMetadata = useNftMetadata();
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
  return (
    <Button
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

/*
function Nft({ nftMetadata }: any) {
  const classes = useStyles();
  return (
    <div style={{ height: "164px", overflow: "hidden" }}>
      <img
        src={nftMetadata.tokenMetaUriData.image}
        className={classes.nftImage}
      />
    </div>
  );
}

*/
