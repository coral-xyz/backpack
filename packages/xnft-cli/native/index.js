const build = require("./build");
const start = require("./start");
const watch = require("./watch");

module.exports = (program) => {
  program.description("CLI for react-native xNFTs");
  watch(program);
  build(program);
  start(program);
};
