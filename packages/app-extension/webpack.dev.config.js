const path = require("path");
const options = require("./webpack.config");

options.resolve.alias = {
  // NOTE(peter): for whatever reason react is being installed in multiple places and breaking tamagui
  // this was the best i could do to ensure it pulls the correct version until i figure out why. this is what's supposed to happen anyway
  // if you find yourself here, run `ls node_modules/react` and if the folder exists, this stays, if it doesn't, you can safely remove
  react: path.resolve("../../node_modules/react"),
  "react-dom": path.resolve("../../node_modules/react-dom"),
  "@coral-xyz/data-components": path.resolve(
    __dirname,
    "../data-components/src"
  ),
  "@coral-xyz/recoil": path.resolve(__dirname, "../recoil/src"),
  "@coral-xyz/react-common": path.resolve(__dirname, "../react-common/src"),
  "@coral-xyz/tamagui": path.resolve(__dirname, "../tamagui-core/src"),
  "react-native$": "react-native-web",
};

module.exports = options;
