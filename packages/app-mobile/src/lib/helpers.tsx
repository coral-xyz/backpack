import { useEffect } from "react";
import { View, Button } from "react-native";

import { useRecoilSnapshot, useRecoilCallback } from "recoil";

export function DebugObserver(): null {
  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    console.debug("recoil::start");
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug("recoil::", node.key, snapshot.getLoadable(node));
    }
    console.debug("recoil::end");
  }, [snapshot]);

  return null;
}

export function DebugButton(): JSX.Element {
  const onPress = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        console.group("recoil");
        console.debug("Atom values:");
        for (const node of snapshot.getNodes_UNSTABLE()) {
          const value = await snapshot.getPromise(node);
          console.debug(node.key, value);
        }
        console.groupEnd();
      },
    []
  );

  return (
    <View style={{ position: "absolute", top: 60, zIndex: 9999 }}>
      <Button onPress={onPress} title="Dump recoil state" />
    </View>
  );
}

export function maybeParseLog({
  channel,
  data,
}: {
  channel:
    | "mobile-logs"
    | "mobile-fe-response"
    | "mobile-bg-response"
    | "mobile-bg-request";
  data: any;
}): void {
  try {
    switch (channel) {
      case "mobile-logs": {
        const [name, ...rest] = data;
        const color = name.includes("ERROR") ? "red" : "brown";
        console.group(`${channel}:${name}`);
        console.log(`%c${channel}:${name}`, `color: ${color}`);
        console.log(rest);
        console.log(`%c---`, `color: ${color}`);
        console.groupEnd();
        break;
      }
      case "mobile-bg-response":
      case "mobile-bg-request":
      case "mobile-fe-response": {
        const name = data.wrappedEvent.channel;
        const color = "orange";
        console.log(`%c${channel}:${name}`, `color: ${color}`);
        console.log(data.wrappedEvent.data);
        console.log(`%c---`, `color: ${color}`);
        break;
      }
      default: {
        console.group(channel);
        console.log("%c" + channel, `color: green`);
        console.log(data);
        console.groupEnd();
      }
    }
  } catch (error) {
    console.error(channel, error);
  }
}
