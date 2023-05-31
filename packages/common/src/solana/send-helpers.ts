// Used in Sending NFTs and Tokens in app-extension and app-mobile
// This was all copied over so it can be shared.
// do not blame peter if this doesn't work, he closed his eyes and press cmd + v

import { findMintManagerId } from "@cardinal/creator-standard";
import { programs, tryGetAccount } from "@cardinal/token-manager";
import {
  findMintStatePk,
  MintState,
} from "@magiceden-oss/open_creator_protocol";
import {
  Metadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import type { AccountInfo, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { metadataAddress } from "./programs/token";
import type { RawMintWithProgramIdString } from "./types";

export const isCardinalWrappedToken = async (
  connection: Connection,
  mintId: PublicKey,
  mintInfo: RawMintWithProgramIdString
) => {
  const mintManagerId = (
    await programs.tokenManager.pda.findMintManagerId(mintId)
  )[0];
  if (
    !mintInfo.freezeAuthority ||
    mintInfo.freezeAuthority !== mintManagerId.toString()
  ) {
    return false;
  }

  // only need network calls to double confirm but the above check is likely sufficient if we assume it was created correctly
  const [tokenManagerId] =
    await programs.tokenManager.pda.findTokenManagerAddress(
      new PublicKey(mintId)
    );
  const tokenManagerData = await tryGetAccount(() =>
    programs.tokenManager.accounts.getTokenManager(connection, tokenManagerId)
  );
  if (!tokenManagerData?.parsed) {
    return false;
  }
  try {
    await programs.transferAuthority.accounts.getTransferAuthority(
      connection,
      tokenManagerData?.parsed.transferAuthority || new PublicKey("")
    );
    return true;
  } catch (error) {
    console.log("Invalid transfer authority");
  }
  return false;
};

export const isCreatorStandardToken = (
  mintId: PublicKey,
  mintInfo: RawMintWithProgramIdString
) => {
  const mintManagerId = findMintManagerId(mintId);
  // not network calls involved we can assume this token was created properly if the mint and freeze authority match
  return (
    mintInfo.freezeAuthority &&
    mintInfo.mintAuthority &&
    mintInfo.freezeAuthority === mintManagerId.toString() &&
    mintInfo.mintAuthority === mintManagerId.toString()
  );
};

export async function isOpenCreatorProtocol(
  connection: Connection,
  mintId: PublicKey,
  mintInfo: RawMintWithProgramIdString
): Promise<MintState | null> {
  const mintStatePk = findMintStatePk(mintId);
  const accountInfo = (await connection.getAccountInfo(
    mintStatePk
  )) as AccountInfo<Buffer>;
  return accountInfo !== null
    ? MintState.fromAccountInfo(accountInfo)[0]
    : null;
}

export async function isProgrammableNftToken(
  connection: Connection,
  mintAddress: string
): Promise<boolean> {
  try {
    const metadata = await Metadata.fromAccountAddress(
      connection,
      await metadataAddress(new PublicKey(mintAddress))
    );

    return metadata.tokenStandard == TokenStandard.ProgrammableNonFungible;
  } catch (error) {
    // most likely this happens if the metadata account does not exist
    console.log(error);
    return false;
  }
}
