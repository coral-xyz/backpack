import type { BigNumber } from "ethers";

import { Text } from "react-native";

import { Blockchain, walletAddressDisplay } from "@coral-xyz/common";
import {
  useSolanaCtx,
  useSolanaTransaction,
  SolTransactionStep,
} from "@coral-xyz/recoil";

import {
  Error,
  Sending,
  Header,
  Container,
} from "~components/BottomDrawerCards";
import { Margin, PrimaryButton, TokenAmountHeader } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { SettingsList } from "~screens/Unlocked/Settings/components/SettingsMenuList";

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
  onCompleteStep?: (step: SolTransactionStep) => void;
}): JSX.Element {
  const { txSignature, onConfirm, cardType, error } = useSolanaTransaction({
    token,
    destinationAddress,
    amount,
    onComplete: () => {
      onCompleteStep?.(cardType);
    },
  });

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
