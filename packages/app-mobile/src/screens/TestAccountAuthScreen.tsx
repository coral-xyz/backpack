import { useState } from "react";
import { Button, Text, View } from "react-native";

import {
  UI_RPC_METHOD_ACTIVE_USER_UPDATE,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import {
  useAllUsers,
  useBackgroundClient,
  useKeyringStoreState,
  useUser,
} from "@coral-xyz/recoil";

export function TestAccountAuthScreen() {
  const background = useBackgroundClient();
  const keyringStoreState = useKeyringStoreState();
  const user = useUser();
  const users = useAllUsers();
  const [status, setStatus] = useState("");

  const f = (user) => {
    return {
      uuid: user.uuid,
      username: user.username,
    };
  };

  return (
    <View
      style={{ backgroundColor: "#EEE", flex: 1, justifyContent: "center" }}
    >
      <Text>
        {JSON.stringify(
          { status, keyringStoreState, user: f(user), users: users.map(f) },
          null,
          2
        )}
      </Text>
      <View>
        {users.map((user) => (
          <View
            key={user.uuid}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text>{user.username}</Text>
            <Button
              title="Unlock"
              onPress={async () => {
                const res = await background.request({
                  method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
                  params: ["backpack", user.uuid],
                });
                setStatus(res);
              }}
            />
            <Button
              title="Lock"
              onPress={async () => {
                const res = await background.request({
                  method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
                  params: [],
                });

                setStatus(res);
              }}
            />
            <Button
              title="Update"
              onPress={async () => {
                await background.request({
                  method: UI_RPC_METHOD_ACTIVE_USER_UPDATE,
                  params: [user.uuid],
                });
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
