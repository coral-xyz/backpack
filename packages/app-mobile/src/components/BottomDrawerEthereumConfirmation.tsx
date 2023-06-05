import type { UnsignedTransaction } from "@ethersproject/transactions";
import type { BigNumber } from "ethers";

import { Suspense, useEffect, useState } from "react";
import { Text, Image, ActivityIndicator } from "react-native";

import {
  Blockchain,
  Ethereum,
  getLogger,
  formatWalletAddress,
} from "@coral-xyz/common";
import { useEthereumCtx, useTransactionData } from "@coral-xyz/recoil";
import { ethers } from "ethers";
import { ErrorBoundary } from "react-error-boundary";

import {
  Error,
  Sending,
  Header,
  Container,
} from "~components/BottomDrawerCards";
import { EthereumAdvancedSettings } from "~components/EthereumAdvancedSettings";
import { TransactionData } from "~components/TransactionData";
import { PrimaryButton, TokenAmountHeader, Margin } from "~components/index";

const logger = getLogger("send-ethereum-confirmation-card");
const { base58: bs58 } = ethers.utils;

const error =
  "Error 422. Transaction time out. Runtime error. Reticulating splines.";

type TokenTypeFungible = {
  address?: string;
  logo: string;
  ticker: string;
  decimals: number;
};

type TokenTypeCollectible = {
  logo: string;
  decimals: number;
  address: string;
  tokenId: string;
};

// TODO consoliate with Solana?
type Destination = {
  address: string;
  walletName?: string;
  username?: string;
  image?: string;
  uuid?: string;
};

function Confirmation({
  type,
  token,
  amount,
  destination,
  transaction,
  onConfirm,
  onToggleAdvanced,
}: {
  type: "nft" | "token";
  token: TokenTypeFungible | TokenTypeCollectible;
  amount: BigNumber;
  destination: Destination;
  transaction: UnsignedTransaction;
  onConfirm: (transactionToSend: UnsignedTransaction) => void;
  onToggleAdvanced: () => object;
}) {
  const transactionData = useTransactionData(
    Blockchain.ETHEREUM,
    bs58.encode(ethers.utils.serializeTransaction(transaction))
  );

  const { from, loading, transaction: transactionToSend } = transactionData;

  const menuItems = {
    From: {
      disabled: true,
      detail: <Text>{formatWalletAddress(from)}</Text>,
    },
    To: {
      disabled: true,
      detail: <Text>{formatWalletAddress(destination.address)}</Text>,
    },
  };

  const title = !destination.username
    ? "Send to your wallet"
    : `Send to ${destination.username}`;

  return (
    <Container>
      <Header text={title} />
      <Margin vertical={24}>
        {type === "token" ? (
          <TokenAmountHeader amount={amount} token={token} />
        ) : (
          <Image
            source={{ uri: token.logo }}
            style={{ width: 128, height: 128, borderRadius: 12 }}
          />
        )}
      </Margin>
      <Margin bottom={24}>
        <TransactionData
          transactionData={transactionData}
          menuItems={menuItems}
          onToggleAdvanced={onToggleAdvanced}
        />
      </Margin>
      <PrimaryButton
        label="Send"
        disabled={loading}
        onPress={() =>
          onConfirm(
            ethers.utils.parseTransaction(bs58.decode(transactionToSend))
          )
        }
      />
    </Container>
  );
}

export function SendEthereumConfirmationCard({
  type,
  navigation,
  token,
  amount,
  destination,
  onComplete,
}: {
  type: "nft" | "token";
  navigation: any;
  token: TokenTypeFungible | TokenTypeCollectible;
  destination: Destination;
  amount: BigNumber;
  onComplete?: () => void;
}) {
  const destinationAddress = destination.address;
  const ethereumCtx = useEthereumCtx();
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<UnsignedTransaction | null>(
    null
  );
  const [cardType, setCardType] = useState<
    "confirm" | "sending" | "complete" | "error" | "advanced"
  >("confirm");

  // The transaction to be executed when the Send action is confirmed. We pass
  // the full transaction to the ConfirmSendEtherem component so it can use it
  // to estimate the gas/network fees required to execute. The
  // Confirmation component may modify the transaction overrides (i.e.
  // gas limits, etc) before returning it to this component foe execution in
  // onConfirm().
  useEffect(() => {
    (async () => {
      let transaction;
      if (token.address === ethers.constants.AddressZero) {
        // Zero address token is native ETH
        transaction = await Ethereum.transferEthTransaction(ethereumCtx, {
          to: destinationAddress,
          value: amount.toString(),
        });
      } else if (token.tokenId) {
        // type = 'nft'
        // Token has a tokenId, must be an ERC721 token
        transaction = await Ethereum.transferErc721Transaction(ethereumCtx, {
          to: destinationAddress,
          from: ethereumCtx.walletPublicKey,
          contractAddress: token.address!,
          tokenId: token.tokenId,
        });
      } else {
        // type = 'token'
        // Otherwise assume it is an ERC20 token
        transaction = await Ethereum.transferErc20Transaction(ethereumCtx, {
          to: destinationAddress,
          contractAddress: token.address!,
          amount: amount.toString(),
        });
      }
      setTransaction(transaction);
    })();
  }, []);

  const onConfirm = async (transactionToSend: UnsignedTransaction) => {
    setTransaction(transactionToSend);
    const _txSignature = await Ethereum.signAndSendTransaction(
      ethereumCtx,
      transactionToSend
    );
    setCardType("sending");
    setTxSignature(_txSignature);
    //
    // Confirm the tx.
    //
    try {
      // Wait for mining
      await ethereumCtx.provider.waitForTransaction(_txSignature);
      // Grab the transaction
      const transaction = await ethereumCtx.provider.getTransaction(
        _txSignature
      );
      // We already waited, but calling .wait will throw if the transaction failed
      await transaction.wait();
      setCardType("complete");
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      logger.error("ethereum transaction failed", err);
      setCardType("error");
    }
  };

  if (!transaction) {
    // TODO loader
    return null;
  }

  const retry = () => onConfirm(transaction);

  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<ActivityIndicator />}>
        {cardType === "confirm" ? (
          <Confirmation
            type={type}
            token={token}
            destination={destination}
            transaction={transaction}
            amount={amount}
            onConfirm={onConfirm}
            onToggleAdvanced={() => setCardType("advanced")}
          />
        ) : cardType === "sending" ? (
          <Sending
            navigation={navigation}
            blockchain={Blockchain.ETHEREUM}
            isComplete={false}
            amount={amount}
            token={token}
            signature={txSignature!}
          />
        ) : cardType === "complete" ? (
          <Sending
            navigation={navigation}
            blockchain={Blockchain.ETHEREUM}
            isComplete
            amount={amount}
            token={token}
            signature={txSignature!}
          />
        ) : cardType === "advanced" ? (
          <EthereumAdvancedSettings
            token={token}
            blockchain={Blockchain.ETHEREUM}
            destinationAddress={destinationAddress}
            transaction={transaction}
            amount={amount}
            onClose={() => setCardType("confirm")}
          />
        ) : (
          <Error
            blockchain={Blockchain.ETHEREUM}
            signature={txSignature!}
            onRetry={() => retry()}
            error={error}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
