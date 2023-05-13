import type { BigNumber } from "ethers";

import { memo, Suspense } from "react";
import { Image, ActivityIndicator, Text } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import { useSolanaTransaction, SolTransactionStep } from "@coral-xyz/recoil";
import { ErrorBoundary } from "react-error-boundary";

import {
  Error,
  Sending,
  Header,
  Container,
} from "~components/BottomDrawerCards";
import { Table } from "~components/Table";
import {
  Margin,
  PrimaryButton,
  TokenAmountHeader,
  CurrentUserAvatarWalletNameAddress,
  AvatarUserNameAddress,
  WalletAddressLabel,
} from "~components/index";

type TokenTypeFungible = {
  address: string;
  logo?: string;
  mint?: string;
  tokenId?: string;
  ticker?: string;
  decimals: number;
};

export type TokenTypeCollectible = {
  address: string;
  image: string;
  mint: string;
};

export type Destination = {
  address: string;
  walletName?: string;
  username?: string;
  image?: string;
  uuid?: string;
};

function ConfirmToken({
  destination,
  token,
  amount,
  onConfirm,
}: {
  destination: Destination;
  token: TokenTypeFungible;
  amount: BigNumber;
  onConfirm: () => void;
}) {
  const title = !destination.username
    ? "Send to your wallet"
    : `Send to ${destination.username}`;

  const destinationLabel = (destination.username ||
    destination.walletName) as string;

  return (
    <Container>
      <Header text={title} />
      <Margin vertical={24}>
        <TokenAmountHeader amount={amount} token={token} />
      </Margin>
      <Margin bottom={24}>
        <Breakdown
          address={destination.address}
          username={destinationLabel}
          avatarUrl={destination.image}
        />
      </Margin>
      <PrimaryButton label="Send" onPress={onConfirm} />
    </Container>
  );
}

function ConfirmCollectible({
  destination,
  nft,
  onConfirm,
}: {
  destination: Destination;
  nft: TokenTypeCollectible;
  onConfirm: () => void;
}) {
  const title = !destination.username
    ? "Send to your wallet"
    : `Send to ${destination.username}`;

  const destinationLabel = (destination.username ||
    destination.walletName) as string;

  return (
    <Container>
      <Header text={title} />
      <Margin vertical={24}>
        <Image
          source={{ uri: nft.image }}
          style={{ width: 128, height: 128, borderRadius: 12 }}
        />
      </Margin>
      <Margin bottom={24}>
        <Breakdown
          address={destination.address}
          username={destinationLabel}
          avatarUrl={destination.image}
        />
      </Margin>
      <PrimaryButton label="Send" onPress={onConfirm} />
    </Container>
  );
}

function Confirmation({
  type,
  destination,
  amount,
  onConfirm,
  token,
}: {
  type: "nft" | "token";
  destination: Destination;
  amount: BigNumber;
  onConfirm: () => void;
  token: TokenTypeFungible | TokenTypeCollectible;
}) {
  if (type === "nft") {
    return (
      <ConfirmCollectible
        nft={token as TokenTypeCollectible}
        destination={destination}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <ConfirmToken
      token={token as TokenTypeFungible}
      amount={amount}
      destination={destination}
      onConfirm={onConfirm}
    />
  );
}

const Breakdown = memo(function Breakdown({
  username,
  avatarUrl,
  address,
  networkFee = "0.0000005",
}: {
  address: string;
  username?: string;
  avatarUrl?: string;
  networkFee?: string;
}): JSX.Element {
  const feeValue = `${networkFee} SOL`;

  const menuItems = {
    From: {
      label: "From",
      children: <CurrentUserAvatarWalletNameAddress />,
    },
    To: {
      label: "To",
      children:
        // public keys w/o users are supported
        // username can also be wallet name here
        // consider renaming username to name or label
        username && avatarUrl ? (
          <AvatarUserNameAddress
            username={username}
            avatarUrl={avatarUrl}
            publicKey={address}
          />
        ) : (
          <WalletAddressLabel publicKey={address} />
        ),
    },
    NetworkFee: {
      label: "Network fee",
      value: feeValue,
    },
  };

  return <Table menuItems={menuItems} />;
});

export function SendSolanaConfirmationCard({
  type,
  navigation,
  token,
  amount,
  destination,
  onCompleteStep,
}: {
  type: "nft" | "token";
  navigation: any;
  token: TokenTypeFungible | TokenTypeCollectible;
  amount: BigNumber;
  destination: Destination;
  onCompleteStep?: (step: SolTransactionStep) => void;
}): JSX.Element {
  const { txSignature, onConfirm, cardType, error } = useSolanaTransaction({
    token,
    destinationAddress: destination.address,
    amount,
    onComplete: () => {
      onCompleteStep?.(cardType);
    },
  });

  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<ActivityIndicator />}>
        {cardType === "confirm" ? (
          <Confirmation
            type={type}
            destination={destination}
            token={token}
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
      </Suspense>
    </ErrorBoundary>
  );
}
