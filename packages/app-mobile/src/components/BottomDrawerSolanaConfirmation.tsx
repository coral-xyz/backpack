import type { BigNumber } from "ethers";

import { useState } from "react";
import { Text } from "react-native";

import {
  Blockchain,
  confirmTransaction,
  SOL_NATIVE_MINT,
  Solana,
  walletAddressDisplay,
  isCardinalWrappedToken,
  isCreatorStandardToken,
  isOpenCreatorProtocol,
  isProgrammableNftToken,
} from "@coral-xyz/common";
import { useSolanaCtx, useSolanaTokenMint } from "@coral-xyz/recoil";
import { PublicKey } from "@solana/web3.js";

import {
  Error,
  Sending,
  Header,
  Container,
} from "~components/BottomDrawerCards";
import { Margin, PrimaryButton, TokenAmountHeader } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";

type Step = "confirm" | "sending" | "complete" | "error";

export function SendSolanaConfirmationCard({
  navigation,
  token,
  destinationAddress,
  amount,
  onCompleteStep,
}: {
  navigation: any;
  token: {
    address: string;
    logo: string;
    decimals: number;
    tokenId?: string;
    mint?: string;
  };
  destinationAddress: string;
  amount: BigNumber;
  onCompleteStep?: (step: Step) => void;
}): JSX.Element {
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const solanaCtx = useSolanaCtx();
  const [error, setError] = useState(
    "Error 422. Transaction time out. Runtime error. Reticulating splines."
  );
  const [cardType, setCardType] = useState<Step>("confirm");

  const handleChangeStep = (step: Step) => {
    setCardType(step);
    if (onCompleteStep) {
      onCompleteStep(step);
    }
  };

  const mintInfo = useSolanaTokenMint({
    publicKey: solanaCtx.walletPublicKey.toString(),
    tokenAddress: token.address,
  });

  const onConfirm = async () => {
    handleChangeStep("sending");
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
          source: new PublicKey(token.address),
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
      setError(err.toString());
      handleChangeStep("error");
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
      handleChangeStep("complete");
    } catch (err: any) {
      setError(err.toString());
      handleChangeStep("error");
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
          navigation={navigation}
          blockchain={Blockchain.SOLANA}
          isComplete={false}
          amount={amount}
          token={token}
          signature={txSignature!}
        />
      ) : cardType === "complete" ? (
        <Sending
          navigation={navigation}
          blockchain={Blockchain.SOLANA}
          isComplete
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
  return (
    <Container>
      <Header text="Review Send" />
      <Margin vertical={24}>
        <TokenAmountHeader amount={amount} token={token} />
      </Margin>
      <Margin bottom={24}>
        <ConfirmSendSolanaTable destinationAddress={destinationAddress} />
      </Margin>
      <PrimaryButton onPress={() => onConfirm()} label="Send" />
    </Container>
  );
}

export const ConfirmSendSolanaTable: React.FC<{
  destinationAddress: string;
}> = ({ destinationAddress }) => {
  const theme = useTheme();
  const solanaCtx = useSolanaCtx();

  const menuItems = {
    From: {
      disabled: true,
      onPress: () => {},
      detail: <Text>{walletAddressDisplay(solanaCtx.walletPublicKey)}</Text>,
    },
    To: {
      disabled: true,
      onPress: () => {},
      detail: <Text>{walletAddressDisplay(destinationAddress)}</Text>,
    },
    "Network fee": {
      disabled: true,
      onPress: () => {},
      detail: (
        <Text>
          <Text>0.000005</Text>
          <Text style={{ color: theme.custom.colors.secondary }}>SOL</Text>
        </Text>
      ),
    },
  };

  return (
    <SettingsList
      borderColor={theme.custom.colors.approveTransactionTableBackground}
      menuItems={menuItems}
    />
  );
};
