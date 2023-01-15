const path = require("path");
const options = require("./webpack.config");

options.resolve.alias = {
  "@coral-xyz/chat-sdk": path.resolve(__dirname, "../chat-sdk/src"),
  "@coral-xyz/react-xnft-dom-renderer": path.resolve(
    __dirname,
    "../react-xnft-dom-renderer/src"
  ),
  "@coral-xyz/themes": path.resolve(__dirname, "../themes/src"),
  "@coral-xyz/recoil": path.resolve(__dirname, "../recoil/src"),
  "@coral-xyz/react-common": path.resolve(__dirname, "../react-common/src"),
  "@coral-xyz/db": path.resolve(__dirname, "../db/src"),
  "@coral-xyz/message-sdk": path.resolve(__dirname, "../message-sdk/src"),
  "@api": path.resolve(__dirname, "src/api"),
  "@assets": path.resolve(__dirname, "src/assets"),
  "@components": path.resolve(__dirname, "src/components"),
  "@hooks": path.resolve(__dirname, "src/hooks"),
  "@utils": path.resolve(__dirname, "src/utils"),
  "@src": path.resolve(__dirname, "src"),
};

module.exports = options;
