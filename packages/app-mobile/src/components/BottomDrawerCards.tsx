import type { Blockchain } from "@coral-xyz/common";
import type { BigNumber } from "ethers";

import { Text, View, StyleSheet, StyleProp, ViewStyle } from "react-native";

import * as Linking from "expo-linking";

import { explorerUrl } from "@coral-xyz/common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { Box } from "@coral-xyz/tamagui";

import { CheckIcon, CrossIcon } from "~components/Icon";
import {
  Margin,
  Loading,
  PrimaryButton,
  SecondaryButton,
  TokenAmountHeader,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function Container({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
});

function IconContainer({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Margin top={24} bottom={36}>
      <View style={{ height: 50, alignItems: "center" }}>{children}</View>
    </Margin>
  );
}

export function Header({ text }: { text: string }): JSX.Element {
  const theme = useTheme();
  const color = theme.custom.colors.fontColor;
  return (
    <Text
      style={{
        textAlign: "center",
        color,
        fontSize: 18,
        fontWeight: "500",
      }}
    >
      {text}
    </Text>
  );
}

function SubHeader({
  isError,
  text,
}: {
  isError?: boolean;
  text: string;
}): JSX.Element {
  const theme = useTheme();
  const color = isError
    ? theme.custom.colors.error
    : theme.custom.colors.secondary;
  return (
    <Text
      style={{
        textAlign: "center",
        color,
        fontSize: 14,
        fontWeight: "500",
      }}
    >
      {text}
    </Text>
  );
}

export function Sending({
  navigation,
  blockchain,
  amount,
  token,
  signature,
  isComplete,
  titleOverride,
}: {
  navigation: any;
  blockchain: Blockchain;
  amount: BigNumber;
  token: any;
  signature: string;
  isComplete: boolean;
  titleOverride?: string;
}) {
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  return (
    <Container>
      <View>
        <SubHeader
          text={
            titleOverride ? titleOverride : isComplete ? "Sent" : "Sending..."
          }
        />
        <Margin vertical={18}>
          <TokenAmountHeader amount={amount} token={token} />
        </Margin>
        <IconContainer>
          {isComplete ? <CheckIcon /> : <Loading size="large" />}
        </IconContainer>
      </View>
      <View>
        {explorer && connectionUrl ? (
          <>
            <SecondaryButton
              disabled={!isComplete}
              label={isComplete ? "View Balances" : "View Explorer"}
              onPress={() => {
                Linking.openURL(
                  explorerUrl(explorer, signature, connectionUrl)
                );
              }}
            />
            {isComplete ? (
              <Margin top={8}>
                <PrimaryButton
                  label="Close"
                  // Uncomment when tabs are back
                  // onPress={() => {
                  //   navigation.reset({
                  //     index: 0,
                  //     routes: [{ name: "Tabs" }],
                  //   });
                  // }}
                  onPress={() => {
                    navigation.popToTop();
                    navigation.goBack(null);
                  }}
                />
              </Margin>
            ) : null}
          </>
        ) : null}
      </View>
    </Container>
  );
}

export function Error({
  blockchain,
  signature,
  onRetry,
  error,
}: {
  blockchain: Blockchain;
  signature: string;
  error: string;
  onRetry: () => void;
}) {
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const theme = useTheme();

  return (
    <Container>
      <SubHeader isError text="Error" />
      <IconContainer>
        <CrossIcon />
      </IconContainer>
      <Box mb={16}>
        <Text style={{ color: theme.custom.colors.fontColor }}>{error}</Text>
      </Box>
      {explorer && connectionUrl && signature ? (
        <SecondaryButton
          label="View Explorer"
          onPress={() => {
            Linking.openURL(explorerUrl(explorer, signature, connectionUrl));
          }}
        />
      ) : null}
      <Box mt={4}>
        <PrimaryButton label="Retry" onPress={() => onRetry()} />
      </Box>
    </Container>
  );
}
