import { Image, SendRounded } from "@mui/icons-material";

// TODO: move reused styles into classes
export const ListItemIcons = {
  Nft: ({ nftUrl }: { nftUrl?: string }) => {
    return (
      <img
        style={{
          borderRadius: "4px",
          width: "44px",
          height: "44px",
          marginRight: "15px",
        }}
        src={nftUrl}
      />
    );
  },
  Sent: () => {
    return (
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "22px",
          marginRight: "12px",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <SendRounded
          style={{
            color: "#8F929E",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    );
  },
  NftDefault: () => {
    return (
      <Image
        style={{
          borderRadius: "4px",
          width: "44px",
          height: "44px",
          marginRight: "15px",
          fill: "#99A4B4",
        }}
      />
    );
  },
};
