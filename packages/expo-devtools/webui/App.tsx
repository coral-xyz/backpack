import { useDevToolsPluginClient, type EventSubscription } from "expo/devtools";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, FlatList } from "react-native";

export default function App() {
  const client = useDevToolsPluginClient("backpack-devtools");
  const [logs, setLogs] = useState([]);

  const createLogItem = (message, type) => {
    setLogs((logs) => [...logs, { message, type }]);
  };

  useEffect(() => {
    const subscriptions: EventSubscription[] = [];

    subscriptions.push(
      ...[
        // client?.addMessageListener("ping", (data) => {
        //   alert(`??Received ping from ${data.from}`);
        //   client?.sendMessage("ping", { from: "web" });
        // }),
        client?.addMessageListener("log", (message) => {
          createLogItem(message, "log");
        }),
        client?.addMessageListener("warn", (message) => {
          createLogItem(message, "warn");
        }),
        client?.addMessageListener("error", (message) => {
          createLogItem(message, "error");
        }),
      ]
    );

    return () => {
      for (const subscription of subscriptions) {
        subscription?.remove();
      }
    };
  }, [client]);

  return (
    <View style={styles.container}>
      <FlatList
        style={{ width: "100%", marginHorizontal: 16 }}
        data={logs}
        renderItem={({ item }) => {
          try {
            const msg = JSON.parse(item.message);
            const data = msg.data?.wrappedEvent
              ? msg.data.wrappedEvent
              : msg.data;
            return (
              <View
                style={{
                  paddingVertical: 12,
                  borderBottomColor: "#eee",
                  borderBottomWidth: 1,
                }}
              >
                <Text>{msg.channel}</Text>
                <Text>{JSON.stringify(data, null, 2)}</Text>
              </View>
            );
          } catch (error) {
            return <Text>{item.message}</Text>;
          }
        }}
      />
      <View style={styles.footer}>
        <Text style={[styles.text, styles.devHint]}>
          For development, you can also add `devServer` query string to specify
          the WebSocket target to the app's dev server.
        </Text>
        <Text style={[styles.text, styles.devHint]}>For example:</Text>
        <Pressable
          onPress={() => {
            window.location.href =
              window.location.href + "?devServer=localhost:8081";
          }}
        >
          <Text style={[styles.text, styles.textLink]}>
            {`${window.location.href}?devServer=localhost:8081`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  devHint: {
    color: "#666",
  },
  textLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  footer: {
    paddingTop: 12,
    textAlign: "center",
  },
});
