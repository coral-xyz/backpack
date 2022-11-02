import { useState } from "react";
import { BigNumber } from "ethers";
import { PublicKey, Connection } from "@solana/web3.js";
import { Typography } from "@mui/material";
import { useSolanaCtx } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  confirmTransaction,
  getLogger,
  Blockchain,
  Solana,
  SOL_NATIVE_MINT,
} from "@coral-xyz/common";
import { walletAddressDisplay, PrimaryButton } from "../../../../common";
import { SettingsList } from "../../../../common/Settings/List";
import { Sending, Error } from "../Send";
import { TokenAmountHeader } from "../../../../common/TokenAmountHeader";
import { programs, tryGetAccount } from "@cardinal/token-manager";

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
  amount,
  onComplete,
}: {
  token: {
    address: string;
    logo: string;
    decimals: number;
    tokenId?: string;
    mint?: string;
  };
  destinationAddress: string;
  amount: BigNumber;
  onComplete?: () => void;
}) {
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const solanaCtx = useSolanaCtx();
  const [error, setError] = useState(
    "Error 422. Transaction time out. Runtime error. Reticulating splines."
  );
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error"
  >("confirm");

  const onConfirm = async () => {
    setCardType("sending");
    //
    // Send the tx.
    //
    let txSig;
    try {
      if (token.mint === SOL_NATIVE_MINT.toString()) {
        txSig = await Solana.transferSol(solanaCtx, {
          source: solanaCtx.walletPublicKey,
          destination: new PublicKey(destinationAddress),
          amount: amount.toNumber(),
        });
      } else if (
        await isCardinalWrappedToken(
          solanaCtx.connection,
          token.mint?.toString() as string
        )
      ) {
        txSig = await Solana.transferCardinalToken(solanaCtx, {
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
      if (onComplete) onComplete();
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
          isComplete={true}
          amount={amount}
          token={token}
          signature={txSignature!}
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
}: {
  token: {
    logo?: string;
    ticker?: string;
    decimals: number;
  };
  destinationAddress: string;
  amount: BigNumber;
  onConfirm: () => void;
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
        <ConfirmSendSolanaTable destinationAddress={destinationAddress} />
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
}> = ({ destinationAddress }) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const solanaCtx = useSolanaCtx();

  const menuItems = {
    From: {
      onClick: () => {},
      detail: (
        <Typography>
          {walletAddressDisplay(solanaCtx.walletPublicKey)}
        </Typography>
      ),
      classes: { root: classes.confirmTableListItem },
      button: false,
    },
    To: {
      onClick: () => {},
      detail: (
        <Typography>{walletAddressDisplay(destinationAddress)}</Typography>
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
  };

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
  tokenAddress: string
) => {
  const [tokenManagerId] =
    await programs.tokenManager.pda.findTokenManagerAddress(
      new PublicKey(tokenAddress)
    );
  const tokenManagerData = await tryGetAccount(() =>
    programs.tokenManager.accounts.getTokenManager(connection, tokenManagerId)
  );
  if (tokenManagerData?.parsed && tokenManagerData?.parsed.transferAuthority) {
    try {
      programs.transferAuthority.accounts.getTransferAuthority(
        connection,
        tokenManagerData?.parsed.transferAuthority
      );
      return true;
    } catch (error) {
      console.log("Invalid transfer authority");
    }
  }
  return false;
};
