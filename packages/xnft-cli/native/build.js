const esconfig = require("./esbuild.config.web");
module.exports = (program) => {
  program.command("build").action(() => {
    require("esbuild").build({
      ...esconfig,
      minify: true,
    });
  });
};
