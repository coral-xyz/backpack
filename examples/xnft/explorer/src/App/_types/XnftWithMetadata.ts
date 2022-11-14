import CustomJsonMetadata from "../_types/CustomJsonMetadata";
import { PublicKey } from "@solana/web3.js";
import XnftAccount from "./XnftAccount";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata/dist/src/accounts/Metadata";

type XnftTokenData = {
  owner: PublicKey;
  publicKey: PublicKey;
};

export interface XnftWithMetadata {
  account: XnftAccount;
  json: CustomJsonMetadata;
  metadata: Metadata;
  publicKey: PublicKey;
  token: XnftTokenData;
  installed: boolean;
}
