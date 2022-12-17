const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = {
  plugins: [
    {
      plugin: require("craco-babel-loader"),
      options: {
        includes: [
          resolveApp("../common"),
          resolveApp("../react-shared"),
          resolveApp("../chat-sdk"),
          resolveApp("../themes"),
        ],
      },
    },
  ],
};
