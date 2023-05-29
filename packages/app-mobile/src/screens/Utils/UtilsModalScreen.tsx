import React, { useCallback, useMemo, useRef, memo } from "react";
import { Button, View, Text, StyleSheet, Pressable } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

function createDummyScreen({ title, nextScreen }) {
  return memo(() => {
    const navigation = useNavigation();
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "yellow",
        }}
      >
        <Text>{title}</Text>
        <Button
          title={nextScreen}
          onPress={() => {
            navigation.navigate(nextScreen);
          }}
        />
      </View>
    );
  });
}

const Stack = createStackNavigator();
const ScreenA = createDummyScreen({
  title: "FlatList Screen",
  nextScreen: "ScrollView Screen",
  type: "FlatList",
});

const ScreenB = createDummyScreen({
  title: "ScrollView Screen",
  nextScreen: "SectionList Screen",
  type: "ScrollView",
  count: 25,
});

const ScreenC = createDummyScreen({
  title: "SectionList Screen",
  nextScreen: "View Screen",
  type: "SectionList",
  count: 20,
});

const ScreenD = createDummyScreen({
  title: "View Screen",
  nextScreen: "FlatList Screen",
  type: "View",
  count: 5,
});

const ScreenE = createDummyScreen({
  title: "Settings Screen",
  nextScreen: "FlatList Screen",
  type: "Settings",
  count: 5,
});

const Navigator = () => {
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ headerStatusBarHeight: 0 }}>
        <Stack.Screen name="FlatList Screen" component={ScreenA} />
        <Stack.Screen
          name="ScrollView Screen"
          component={ScreenB}
          options={({ navigation }) => {
            return {
              headerRight: () => (
                <Pressable
                  onPress={() => {
                    navigation.push("Settings Screen");
                  }}
                >
                  <MaterialIcons
                    name="settings"
                    size={24}
                    color="black"
                    style={{ paddingRight: 16 }}
                  />
                </Pressable>
              ),
            };
          }}
        />
        <Stack.Screen name="SectionList Screen" component={ScreenC} />
        <Stack.Screen name="View Screen" component={ScreenD} />
        <Stack.Screen name="Settings Screen" component={ScreenE} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const NavigatorExample = () => {
  // hooks
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const handleSnapPress = useCallback((index) => {
    bottomSheetRef.current?.snapToIndex(index);
  }, []);
  const handleExpandPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);
  const handleCollapsePress = useCallback(() => {
    bottomSheetRef.current?.collapse();
  }, []);
  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button title="Snap To 90%" onPress={() => handleSnapPress(2)} />
      <Button title="Snap To 50%" onPress={() => handleSnapPress(1)} />
      <Button title="Snap To 25%" onPress={() => handleSnapPress(0)} />
      <Button title="Expand" onPress={() => handleExpandPress()} />
      <Button title="Collapse" onPress={() => handleCollapsePress()} />
      <Button title="Close" onPress={() => handleClosePress()} />
      <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints}>
        <Navigator />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NavigatorExample;
