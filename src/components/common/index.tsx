import { PublicKey } from "@solana/web3.js";
import { Typography } from "@material-ui/core";

export function WalletAddress({
  publicKey,
  name,
}: {
  publicKey: PublicKey;
  name: string;
}) {
  const pubkeyStr = publicKey.toString();
  return (
    <Typography>
      <b style={{ marginRight: "8px" }}>{name}</b>(
      {`${pubkeyStr.slice(0, 4)}...${pubkeyStr.slice(pubkeyStr.length - 4)}`})
    </Typography>
  );
}
