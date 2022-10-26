import { createStackNavigator } from "@react-navigation/stack";
import type { StyleProp, TextStyle } from "react-native";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

import Screen from "../components/Screen";
import StyledText from "../components/StyledText";
import useTheme from "../hooks/useTheme";

const Stack = createStackNavigator();

function Header({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: theme.colors.fontColor,
        fontSize: 24,
        fontWeight: "500",
        lineHeight: 32,
      }}
    >
      {text}
    </Text>
  );
}

function SubtextParagraph({
  children,
  style,
}: {
  children: JSX.Element;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          fontWeight: "500",
          marginTop: 8,
          color: theme.colors.subtext,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

function OnboardingScreen({ title, subtitle, children }) {
  return (
    <Screen style={{ padding: 12 }}>
      <View style={{ marginBottom: 12 }}>
        <Header text={title} />
        <SubtextParagraph>{subtitle}</SubtextParagraph>
      </View>
      {children}
    </Screen>
  );
}

// https://github.com/gorhom/react-native-bottom-sheet
function WelcomeScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Backpack
        </StyledText>
        <StyledText>A home for your xNFTs</StyledText>
      </View>
      <View
        style={{
          padding: 12,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Button
          title="Create a new wallet"
          onPress={() => {
            navigation.push("SelectNetwork");
          }}
        />
        <Button
          title="Import an existing wallet"
          onPress={() => {
            navigation.push("SelectNetwork");
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingBlockchainSelectScreen({ navigation }) {
  const NETWORKS = [
    {
      name: "Ethereum",
      enabled: true,
    },
    {
      name: "Solana",
      enabled: true,
    },
    {
      name: "Polygon",
      enabled: false,
    },
    {
      name: "BSC",
      enabled: false,
    },
    {
      name: "Avalanche",
      enabled: false,
    },
    {
      name: "Cosmos",
      enabled: false,
    },
  ];

  function Network({ network, enabled, onSelect }) {
    return (
      <View style={{ padding: 8, height: 50 }}>
        <Pressable onPress={() => enabled && onSelect(network.name)}>
          <Text style={{ color: "#FFF" }}>{network.name}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <OnboardingScreen
      title="Which network would you like Backpack to use?"
      subtitle="You can always add additional networks later through the settings menu."
    >
      {NETWORKS.map((network) => (
        <Network
          enabled={network.enabled}
          network={network}
          onSelect={(network) => {
            console.log(network);
            navigation.push("SecretPhrase");
          }}
        />
      ))}
    </OnboardingScreen>
  );
}

function OnboardingSecretPhraseScreen({ navigation }) {
  return (
    <OnboardingScreen
      title="Secret recovery phrase"
      subtitle="Enter your 12 or 24-word secret recovery mnemonic to add an existing wallet."
    >
      <View style={{ flexDirection: "row" }}>
        <Button
          title="Import"
          onPress={() => {
            navigation.push("ImportAccounts");
          }}
        />
      </View>
    </OnboardingScreen>
  );
}

function OnboardingImportAccountsScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Secret Recovery Phrase
        </StyledText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Button
          title="Import Accounts"
          onPress={() => {
            navigation.push("CreatePassword");
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingCreatePasswordScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Secret Recovery Phrase
        </StyledText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Button
          title="Next"
          onPress={() => {
            navigation.push("Complete");
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingCompleteScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Finished
        </StyledText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Button
          title="Finish"
          onPress={() => {
            navigation.navigate("Welcome");
          }}
        />
      </View>
    </Screen>
  );
}

export default function OnboardingNavigator() {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Group
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.fontColor,
          headerTitle: "",
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="SelectNetwork"
          component={OnboardingBlockchainSelectScreen}
        />
        <Stack.Screen
          name="SecretPhrase"
          component={OnboardingSecretPhraseScreen}
        />
        <Stack.Screen
          name="ImportAccounts"
          component={OnboardingImportAccountsScreen}
        />
        <Stack.Screen
          name="CreatePassword"
          component={OnboardingCreatePasswordScreen}
        />
        <Stack.Screen name="Complete" component={OnboardingCompleteScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingTop: 24,
  },
});
