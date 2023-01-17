import {
  Loading,
  PrimaryButton,
  SecondaryButton,
  TokenAmountHeader,
} from "@components";
import { CheckIcon, CrossIcon } from "@components/Icons";
import type { Blockchain } from "@coral-xyz/common";
import { explorerUrl } from "@coral-xyz/common";
import {
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";
import type { BigNumber } from "ethers";
import * as Linking from "expo-linking";
import { Text, View } from "react-native";

export function Sending({
  blockchain,
  amount,
  token,
  signature,
  isComplete,
  titleOverride,
}: {
  blockchain: Blockchain;
  amount: BigNumber;
  token: any;
  signature: string;
  isComplete: boolean;
  titleOverride?: string;
}) {
  const theme = useTheme();
  const explorer = useBlockchainExplorer(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  return (
    <View>
      <Text
        style={{
          textAlign: "center",
          color: theme.custom.colors.secondary,
          fontSize: 14,
          fontWeight: "500",
          marginTop: 30,
        }}
      >
        {titleOverride ? titleOverride : isComplete ? "Sent" : "Sending..."}
      </Text>
      <TokenAmountHeader
        style={{
          marginTop: 16,
          marginBottom: 0,
        }}
        amount={amount}
        token={token}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        {isComplete ? (
          <CheckIcon />
        ) : (
          <Loading
          // size={48}
          // iconStyle={{
          //   color: theme.custom.colors.primaryButton,
          //   display: "flex",
          //   marginLeft: "auto",
          //   marginRight: "auto",
          // }}
          // thickness={6}
          />
        )}
      </View>
      <View
        style={{
          marginBottom: 16,
          marginLeft: 16,
          marginRight: 16,
        }}
      >
        {explorer && connectionUrl && (
          <SecondaryButton
            onClick={() => {
              if (isComplete) {
                // nav.toRoot();
                // drawer.close();
              } else {
                Linking.openURL(
                  explorerUrl(explorer, signature, connectionUrl)
                );
              }
            }}
            label={isComplete ? "View Balances" : "View Explorer"}
          />
        )}
      </View>
    </View>
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
    <View
      style={{
        height: 340,
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <View
        style={{
          marginTop: 8,
        }}
      >
        <Text
          style={{
            marginBottom: 16,
            color: theme.custom.colors.fontColor,
          }}
        >
          Error
        </Text>
        <View
          style={{
            height: 48,
          }}
        >
          <CrossIcon />
        </View>
        <Text
          style={{
            marginTop: 16,
            marginBottom: 16,
            color: theme.custom.colors.fontColor,
          }}
        >
          {error}
        </Text>
        {explorer && connectionUrl && signature && (
          <SecondaryButton
            label="View Explorer"
            onClick={() =>
              Linking.openURL(explorerUrl(explorer, signature, connectionUrl))
            }
          />
        )}
      </View>
      <PrimaryButton label="Retry" onClick={() => onRetry()} />
    </View>
  );
}
