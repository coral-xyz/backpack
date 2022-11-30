import * as React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
} from "react-native";
import tw from "twrnc";
import { createStackNavigator } from "@react-navigation/stack";

import { Screen } from "../components/Screen";
import { TokenRow } from "../components/TokenRow";

const Stack = createStackNavigator();

function FullScreenLoadingIndicator() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

async function fetchTokenData(count = 20) {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${count}&page=1&sparkline=true&price_change_percentage=24h`;
  return fetch(url).then((r) => r.json());
}

function useTokenData() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    async function fetch() {
      setLoading(true);
      const data = await fetchTokenData();
      console.log("data", data);
      setData(data);
      setLoading(false);
    }

    fetch();
  }, []);

  return { data, loading };
}

function List({ navigation }) {
  const { data, loading } = useTokenData();

  const handlePressTokenRow = (id: string) => {
    navigation.push("Detail", { id });
  };

  if (loading) {
    return <FullScreenLoadingIndicator />;
  }

  const ItemSeparatorComponent = () => (
    <View
      style={{ marginVertical: 8, borderColor: "#eee", borderBottomWidth: 1 }}
    />
  );

  return (
    <Screen>
      <FlatList
        style={{ flex: 1 }}
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparatorComponent}
        renderItem={({ item }) => {
          return (
            <TokenRow
              id={item.id}
              name={item.name}
              price={item.current_price}
              imageUrl={item.image}
              onPress={handlePressTokenRow}
            />
          );
        }}
      />
    </Screen>
  );
}

function Detail({ route }) {
  const { data, loading } = useTokenData();
  const { id } = route.params;

  if (loading) {
    return <FullScreenLoadingIndicator />;
  }

  const item = data.find((d) => d.id === id);

  if (!item) {
    return null;
  }

  return (
    <Screen>
      <View style={tw`bg-yellow-100 items-center justify-center p-4`}>
        <Image source={{ uri: item.image }} style={tw`w-8 h-8 rounded m-4`} />
        <Text style={tw`font-bold text-lg`}>{item.name}</Text>
        <Text style={tw`font-bold text-lg`}>Symbol: {item.symbol}</Text>
        <Text style={tw`font-bold text-lg`}>
          Total supply: {item.total_supply}
        </Text>
        <Text style={tw`font-bold text-lg`}>All time high: {item.ath}</Text>
      </View>
    </Screen>
  );
}

const forSlide = ({ current, next, inverted, layouts: { screen } }) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.width, // Focused, but offscreen in the beginning
                0, // Fully focused
                screen.width * -0.3, // Fully unfocused
              ],
              extrapolate: "clamp",
            }),
            inverted
          ),
        },
      ],
    },
  };
};

export const TokenListNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        animationEnabled: true,
        cardStyleInterpolator: forSlide,
      }}
    >
      <Stack.Screen
        name="List"
        component={List}
        options={{ title: "Token List" }}
      />
      <Stack.Screen
        name="Detail"
        component={Detail}
        options={{ title: "Token Detail" }}
      />
    </Stack.Navigator>
  );
};
