import { useState } from "react";
import { findMintManagerId } from "@cardinal/creator-standard";
import { programs, tryGetAccount } from "@cardinal/token-manager";
import type { RawMintString } from "@coral-xyz/common";
import {
  Blockchain,
  confirmTransaction,
  getLogger,
  metadataAddress,
  SOL_NATIVE_MINT,
  Solana,
} from "@coral-xyz/common";
import { PrimaryButton, UserIcon } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useAvatarUrl,
  useSolanaCtx,
  useSolanaTokenMint,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  findMintStatePk,
  MintState,
} from "@magiceden-oss/open_creator_protocol";
import {
  Metadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { Typography } from "@mui/material";
import type { AccountInfo, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { BigNumber } from "ethers";

import { CopyablePublicKey } from "../../../../common/CopyablePublicKey";
import { SettingsList } from "../../../../common/Settings/List";
import { TokenAmountHeader } from "../../../../common/TokenAmountHeader";
import { Error, Sending } from "../Send";

const logger = getLogger("send-solana-confirmation-card");

const useStyles = styles((theme) => ({
  confirmTableListItem: {
    backgroundColor: `${theme.custom.colors.approveTransactionTableBackground} !important`,
    "&:hover": {
      opacity: 1,
    },
  },
}));

export function SendSolanaConfirmationCard({
  token,
  destinationAddress,
  destinationUser,
  amount,
  onComplete,
  onViewBalances,
}: {
  token: {
    address: string;
    logo: string;
    decimals: number;
    tokenId?: string;
    mint?: string;
  };
  destinationAddress: string;
  destinationUser?: {
    username: string;
    walletName?: string;
    image: string;
  };
  amount: BigNumber;
  onComplete?: (txSig?: any) => void;
  onViewBalances?: () => void;
}) {
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const solanaCtx = useSolanaCtx();
  const [error, setError] = useState(
    "Error 422. Transaction time out. Runtime error. Reticulating splines."
  );
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");
  const mintInfo = useSolanaTokenMint({
    publicKey: solanaCtx.walletPublicKey.toString(),
    tokenAddress: token.address,
  });

  const onConfirm = async () => {
    setCardType("sending");
    //
    // Send the tx.
    //
    let txSig;

    try {
      const mintId = new PublicKey(token.mint?.toString() as string);
      if (token.mint === SOL_NATIVE_MINT.toString()) {
        txSig = await Solana.transferSol(solanaCtx, {
          source: solanaCtx.walletPublicKey,
          destination: new PublicKey(destinationAddress),
          amount: amount.toNumber(),
        });
      } else if (
        await isProgrammableNftToken(
          solanaCtx.connection,
          token.mint?.toString() as string
        )
      ) {
        txSig = await Solana.transferProgrammableNft(solanaCtx, {
          destination: new PublicKey(destinationAddress),
          mint: new PublicKey(token.mint!),
          amount: amount.toNumber(),
          decimals: token.decimals,
        });
      }
      // Use an else here to avoid an extra request if we are transferring sol native mints.
      else {
        const ocpMintState = await isOpenCreatorProtocol(
          solanaCtx.connection,
          mintId,
          mintInfo
        );
        if (ocpMintState !== null) {
          txSig = await Solana.transferOpenCreatorProtocol(
            solanaCtx,
            {
              destination: new PublicKey(destinationAddress),
              amount: amount.toNumber(),
              mint: new PublicKey(token.mint!),
            },
            ocpMintState
          );
        } else if (isCreatorStandardToken(mintId, mintInfo)) {
          txSig = await Solana.transferCreatorStandardToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        } else if (
          await isCardinalWrappedToken(solanaCtx.connection, mintId, mintInfo)
        ) {
          txSig = await Solana.transferCardinalManagedToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        } else {
          txSig = await Solana.transferToken(solanaCtx, {
            destination: new PublicKey(destinationAddress),
            mint: new PublicKey(token.mint!),
            amount: amount.toNumber(),
            decimals: token.decimals,
          });
        }
      }
    } catch (err: any) {
      logger.error("solana transaction failed", err);
      setError(err.toString());
      setCardType("error");
      return;
    }

    setTxSignature(txSig);

    //
    // Confirm the tx.
    //
    try {
      await confirmTransaction(
        solanaCtx.connection,
        txSig,
        solanaCtx.commitment !== "confirmed" &&
          solanaCtx.commitment !== "finalized"
          ? "confirmed"
          : solanaCtx.commitment
      );
      setCardType("complete");
      if (onComplete) onComplete(txSig);
    } catch (err: any) {
      logger.error("unable to confirm", err);
      setError(err.toString());
      setCardType("error");
    }
  };

  return (
    <>
      {cardType === "confirm" ? (
        <ConfirmSendSolana
          token={token}
          destinationAddress={destinationAddress}
          destinationUser={destinationUser}
          amount={amount}
          onConfirm={onConfirm}
        />
      ) : cardType === "sending" ? (
        <Sending
          blockchain={Blockchain.SOLANA}
          isComplete={false}
          amount={amount}
          token={token}
          signature={txSignature!}
        />
      ) : cardType === "complete" ? (
        <Sending
          blockchain={Blockchain.SOLANA}
          isComplete
          amount={amount}
          token={token}
          signature={txSignature!}
          onViewBalances={onViewBalances}
        />
      ) : (
        <Error
          blockchain={Blockchain.SOLANA}
          signature={txSignature!}
          onRetry={onConfirm}
          error={error}
        />
      )}
    </>
  );
}

export function ConfirmSendSolana({
  token,
  destinationAddress,
  amount,
  onConfirm,
  destinationUser,
}: {
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  destinationAddress: string;
  amount: BigNumber;
  onConfirm: () => void;
  destinationUser?: {
    username: string;
    image: string;
  };
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        padding: "16px",
        height: "402px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        paddingBottom: "24px",
      }}
    >
      <div>
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
            textAlign: "center",
          }}
        >
          Review Send
        </Typography>
        <TokenAmountHeader
          style={{
            marginTop: "40px",
            marginBottom: "40px",
          }}
          amount={amount}
          token={token}
        />
        <ConfirmSendSolanaTable
          destinationUser={destinationUser}
          destinationAddress={destinationAddress}
        />
      </div>
      <PrimaryButton
        onClick={() => onConfirm()}
        label="Send"
        type="submit"
        data-testid="Send"
      />
    </div>
  );
}

const ConfirmSendSolanaTable: React.FC<{
  destinationAddress: string;
  destinationUser?: { username: string; image: string; walletName?: string };
}> = ({ destinationAddress, destinationUser }) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const solanaCtx = useSolanaCtx();
  const avatarUrl = useAvatarUrl();
  const wallet = useActiveWallet();

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserIcon marginRight={5} image={avatarUrl} size={24} />
          <Typography variant="body2" style={{ marginRight: 5 }}>
            {wallet.name}
          </Typography>
          <CopyablePublicKey publicKey={solanaCtx.walletPublicKey} />
        </div>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    To: {
      onClick: () => {},
      detail: (
        <div style={{ display: "flex", alignItems: "center" }}>
          {destinationUser ? (
            <>
              <UserIcon
                marginRight={5}
                image={destinationUser.image}
                size={24}
              />
              <Typography variant="body2" style={{ marginRight: 5 }}>
                {destinationUser.walletName
                  ? destinationUser.walletName
                  : `@${destinationUser.username}`}
              </Typography>
            </>
          ) : null}
          <CopyablePublicKey publicKey={destinationAddress} />
        </div>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    "Network fee": {
      onClick: () => {},
      detail: (
        <Typography>
          0.000005{" "}
          <span style={{ color: theme.custom.colors.secondary }}>SOL</span>
        </Typography>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
  } satisfies React.ComponentProps<typeof SettingsList>["menuItems"];

  return (
    <SettingsList
      borderColor={theme.custom.colors.approveTransactionTableBackground}
      menuItems={menuItems}
      style={{
        margin: 0,
      }}
      textStyle={{
        color: theme.custom.colors.secondary,
      }}
    />
  );
};

export const isCardinalWrappedToken = async (
  connection: Connection,
  mintId: PublicKey,
  mintInfo: RawMintString
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
    programs.transferAuthority.accounts.getTransferAuthority(
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
  mintInfo: RawMintString
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

async function isOpenCreatorProtocol(
  connection: Connection,
  mintId: PublicKey,
  mintInfo: RawMintString
): Promise<MintState | null> {
  const mintStatePk = findMintStatePk(mintId);
  const accountInfo = (await connection.getAccountInfo(
    mintStatePk
  )) as AccountInfo<Buffer>;
  return accountInfo !== null
    ? MintState.fromAccountInfo(accountInfo)[0]
    : null;
}

async function isProgrammableNftToken(
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
