import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { HeaderAvatarButton } from "~navigation/components";
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

export type FriendListScreenProps = NativeStackScreenProps<
  FriendsNavigatorStackParamList,
  "FriendList"
>;

export type FriendDetailScreenProps = NativeStackScreenProps<
  FriendsNavigatorStackParamList,
  "FriendDetail"
>;

export function FriendsNavigator() {
  return (
    <FriendStack.Navigator>
      <FriendStack.Screen
        name="FriendList"
        component={FriendListScreen}
        options={({ navigation }) => {
          return {
            title: "Friends",
            headerLeft: (props) => (
              <HeaderAvatarButton {...props} navigation={navigation} />
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
            title: `@${route.params.username}`,
          };
        }}
      />
    </FriendStack.Navigator>
  );
}
