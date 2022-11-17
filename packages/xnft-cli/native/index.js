const build = require("./build");
const start = require("./start");
const dev = require("./dev");

module.exports = (program) => {
  program.description("CLI for react-native xNFTs");
  dev(program);
  build(program);
  start(program);
};
