import { SOL_LOGO_URI } from "@coral-xyz/recoil";
import {
  ArrowDownwardRounded,
  Check,
  ClearRounded,
  Image,
  SendRounded,
  WhatshotRounded,
} from "@mui/icons-material";

// TODO: move reused styles into classes
export const ListItemIcons = {
  SWAP: ({
    tokenLogoOne,
    tokenLogoTwo,
  }: {
    tokenLogoOne?: string;
    tokenLogoTwo?: string;
  }) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          style={{
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            marginRight: "10px",
            marginBottom: "15px",
            zIndex: "10",
          }}
          src={tokenLogoOne}
        />
        <img
          style={{
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            marginRight: "15px",
            marginLeft: "-15px",
          }}
          src={tokenLogoTwo}
        />
      </div>
    );
  },
  TRANSFER: ({ tokenLogo }: { tokenLogo?: string }) => {
    return (
      <img
        style={{
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          marginRight: "15px",
        }}
        src={tokenLogo}
      />
    );
  },
  SOL: () => {
    return (
      <img
        style={{
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          marginRight: "15px",
        }}
        src={SOL_LOGO_URI}
      />
    );
  },
  NFT: ({ nftUrl }: { nftUrl?: string }) => {
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
  SENT: () => {
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
  RECEIVED: () => {
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
        <ArrowDownwardRounded
          style={{
            color: "#8F929E",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    );
  },
  NFT_DEFAULT: () => {
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
  ERROR: () => {
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
        <ClearRounded
          style={{
            color: "#E95050",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    );
  },
  BURN: () => {
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
        <WhatshotRounded
          style={{
            color: "#E95050",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    );
  },
  DEFAULT: () => {
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
        <Check
          style={{
            color: "#35A63A",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>
    );
  },
};
