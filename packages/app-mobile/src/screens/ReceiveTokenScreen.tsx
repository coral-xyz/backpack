import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";

import { Blockchain, toTitleCase } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import { Stack, YStack, StyledText } from "@coral-xyz/tamagui";
import QRCode from "react-qr-code";

import { CopyWalletFieldInput, Margin, Screen } from "~components/index";
import { useTheme } from "~hooks/useTheme";

function BlockchainDisclaimerText({
  blockchain,
}: {
  blockchain: Blockchain;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Text
      style={[
        blockchainDisclaimerTextStyles.text,
        { color: theme.custom.colors.secondary },
      ]}
    >
      {blockchain === Blockchain.SOLANA ? (
        <>This address can only receive SOL and SPL tokens on Solana.</>
      ) : null}
      {blockchain === Blockchain.ETHEREUM ? (
        <>This address can only receive ETH and ERC20 tokens on Ethereum.</>
      ) : null}
    </Text>
  );
}

const blockchainDisclaimerTextStyles = StyleSheet.create({
  text: {
    maxWidth: 280,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});

export function ReceiveToken({
  name,
  publicKey,
  blockchain,
}: {
  name: string;
  publicKey: string;
  blockchain: Blockchain;
}): JSX.Element {
  return (
    <YStack ai="center" justifyContent="flex-end">
      <StyledText
        mb={8}
        fontSize="$base"
        fontWeight="700"
        color="$fontColor"
        textAlign="center"
      >
        {name}
      </StyledText>
      <Stack mt={12} mb={24}>
        <QRCode value={publicKey} size={200} />
      </Stack>
      <Margin top={8} bottom={16}>
        <CopyWalletFieldInput publicKey={publicKey} />
      </Margin>
      <BlockchainDisclaimerText blockchain={blockchain} />
    </YStack>
  );
}

export function ReceiveTokenScreen({ navigation }): JSX.Element {
  const activeWallet = useActiveWallet();
  const { publicKey, blockchain } = activeWallet;

  useEffect(() => {
    navigation.setOptions({ title: `Deposit on ${toTitleCase(blockchain)}` });
  }, [blockchain, navigation]);

  return (
    <Screen>
      <ReceiveToken
        name={activeWallet.name}
        publicKey={publicKey}
        blockchain={blockchain}
      />
    </Screen>
  );
}
