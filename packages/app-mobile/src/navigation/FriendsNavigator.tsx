import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HeaderButton } from "~navigation/components";
import { FriendDetailScreen } from "~screens/FriendDetailScreen";
import { FriendListScreen } from "~screens/FriendListScreen";

export type FriendsNavigatorStackParamList = {
  FriendList: undefined;
  FriendDetail: {
    userId: string;
    username: string;
  };
};

const FriendStack =
  createNativeStackNavigator<FriendsNavigatorStackParamList>();

export function FriendsNavigator() {
  return (
    <FriendStack.Navigator>
      <FriendStack.Screen
        name="FriendList"
        component={FriendListScreen}
        options={({ navigation }) => {
          return {
            title: "Friends",
            headerShown: true,
            headerLeft: (props) => (
              <HeaderButton
                name="menu"
                {...props}
                onPress={() => {
                  navigation.openDrawer();
                }}
              />
            ),
          };
        }}
      />
      <FriendStack.Screen
        name="FriendDetail"
        component={FriendDetailScreen}
        options={({ route }) => {
          return {
            headerBackTitleVisible: false,
            title: route.params.username,
          };
        }}
      />
    </FriendStack.Navigator>
  );
}
