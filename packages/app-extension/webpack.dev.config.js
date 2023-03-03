const path = require("path");
const options = require("./webpack.config");

options.resolve.alias = {
  "@coral-xyz/chat-sdk": path.resolve(__dirname, "../chat-sdk/src"),
  "@coral-xyz/themes": path.resolve(__dirname, "../themes/src"),
  "@coral-xyz/recoil": path.resolve(__dirname, "../recoil/src"),
  "@coral-xyz/react-common": path.resolve(__dirname, "../react-common/src"),
  "@coral-xyz/db": path.resolve(__dirname, "../db/src"),
  "@coral-xyz/message-sdk": path.resolve(__dirname, "../message-sdk/src"),
  "react-native$": "react-native-web",
  "@react-navigation/bottom-tabs": path.resolve(
    __dirname,
    "react-navigation-bottom-tabs.js"
  ),
  "@react-navigation/native": path.resolve(
    __dirname,
    "react-navigation-native.js"
  ),
  "@react-navigation/stack": path.resolve(
    __dirname,
    "react-navigation-stack.js"
  ),
  "react-native-screens": path.resolve(__dirname, "react-native-screens.js"),
};

module.exports = options;
