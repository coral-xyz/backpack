import { RandomBackgroundScreen } from "~screens/Helpers/RandomBackgroundScreen";

// type Plugin = {
//   title: string;
//   iconUrl: string;
//   url: string;
//   install: any;
// };
//
// function PluginGrid() {
//   const plugins = useAppIcons();
//   const background = useBackgroundClient();
//
//   const onPressPlugin = (p: Plugin) => {
//     // Update the URL to use the plugin.
//     //
//     // This will do two things
//     //
//     // 1. Update and persist the new url. Important so that if the user
//     //    closes/re-opens the app, the plugin opens up immediately.
//     // 2. Cause a reload of this route with the plguin url in the search
//     //    params, which will trigger the drawer to activate.
//     //
//     const newUrl = `${location.pathname}${
//       location.search
//     }&plugin=${encodeURIComponent(p.install.account.xnft.toString())}`;
//     console.log("onPressPlugin:newUrl", newUrl);
//     // TODO(peter) probably Linking.openURL ?
//     background
//       .request({
//         method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
//         params: [newUrl],
//       })
//       .catch(console.error);
//   };
//
//   function renderItem({ item }) {
//     return (
//       <Pressable onPress={() => onPressPlugin(item)}>
//         <View>
//           <Text>{item.url}</Text>
//         </View>
//       </Pressable>
//     );
//   }
//
//   // HACK: hide autoinstalled ONE xnft -> entrypoint in collectibles.
//   const pluginsWithoutONExNFT = plugins.filter(
//     (p) =>
//       p.install.account.xfnit.toString() !==
//       "CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8"
//   );
//
//   return (
//     <Screen>
//       <FlatList
//         data={pluginsWithoutONExNFT}
//         numColumns={3}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.url}
//         initialNumToRender={12} // TODO
//       />
//     </Screen>
//   );
// }

export default function AppListScreen() {
  return <RandomBackgroundScreen />;
}
