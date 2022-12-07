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
};

module.exports = options;
