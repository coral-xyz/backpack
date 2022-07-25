import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNftMetadata } from "@coral-xyz/recoil";
import { PrimaryButton } from "../../common";

export function NftsDetail({ publicKey }: { publicKey: string }) {
  const nfts = useNftMetadata();
  const nft = nfts.get(publicKey);

  // Hack: needed because this is undefined due to framer-motion animation.
  if (!publicKey) {
    return <></>;
  }

  return (
    <div
      style={{
        marginTop: "4px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <Image nft={nft} />
      <Description nft={nft} />
      <SendButton nft={nft} />
      <Attributes nft={nft} />
    </div>
  );
}

function Image({ nft }: { nft: any }) {
  return (
    <img
      style={{
        width: "100%",
        height: "343px",
        borderRadius: "8px",
      }}
      src={nft.tokenMetaUriData.image}
    />
  );
}

function Description({ nft }: { nft: any }) {
  const theme = useCustomTheme();

  return (
    <div
      style={{
        marginTop: "20px",
        marginBottom: "4px",
      }}
    >
      <Typography
        style={{
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
    </div>
  );
}

function SendButton({ nft }: { nft: any }) {
  const send = () => {};
  return (
    <PrimaryButton
      style={{
        marginBottom: "24px",
        marginTop: "24px",
      }}
      onClick={() => send()}
      label={"Send"}
    />
  );
}

function Attributes({ nft }: { nft: any }) {
  const theme = useCustomTheme();
  return (
    <div>
      <Typography style={{ color: theme.custom.colors.secondary }}>
        Attributes
      </Typography>
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "4px",
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
    </div>
  );
}
