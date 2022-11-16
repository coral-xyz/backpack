import { Stack } from "react-xnft";
import React from "react";
import AppList from "./AppList";
import AppDetails from "./AppDetails";
import NewAppReview from "./NewAppReview";
// import NewAppReview from "./NewAppReview";

function Navigation() {
  return (
    <Stack.Navigator
      initialRoute={{ name: "list" }}
      options={({ route }) => {
        switch (route.name) {
          case "list":
            return {
              title: "xNFTs",
              props: {
                style: {
                  textAlign: "left",
                },
              },
            };
          case "details": {
            return {
              title: route.props?.app.json.name,
            };
          }
          case "review": {
            return {
              title: "New Review",
            };
          }
          default:
            throw new Error("unknown route");
        }
      }}
      style={{
        font: "Inter",
        fontSize: "20px",
        fontWeight: "700",
        height: "56px",
      }}
    >
      <Stack.Screen name={"list"} component={(props) => <AppList />} />
      <Stack.Screen
        name={"details"}
        component={(props) => <AppDetails {...props} />}
      />
      <Stack.Screen
        name={"review"}
        component={(props) => <NewAppReview {...props} />}
      />
    </Stack.Navigator>
  );
}

export default Navigation;
