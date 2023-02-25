const path = require("path");
const options = require("./webpack.config");

options.resolve.alias = {
  "@coral-xyz/chat-sdk": path.resolve(__dirname, "../chat-sdk/src"),
  "@coral-xyz/themes": path.resolve(__dirname, "../themes/src"),
  "@coral-xyz/recoil": path.resolve(__dirname, "../recoil/src"),
  "@coral-xyz/react-common": path.resolve(__dirname, "../react-common/src"),
  "@coral-xyz/common": path.resolve(__dirname, "../common/src"),
  "@coral-xyz/db": path.resolve(__dirname, "../db/src"),
  "@coral-xyz/message-sdk": path.resolve(__dirname, "../message-sdk/src"),
  "react-native$": "react-native-web",
};

module.exports = options;
