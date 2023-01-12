const bundle = require("./bundle");
const dev = require("./dev");

module.exports = (program) => {
  program.description("CLI for xnfts");
  bundle(program);
  dev(program);
};
