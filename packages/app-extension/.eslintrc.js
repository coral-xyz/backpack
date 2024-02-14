module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  settings: {
    // uses 'eslint-import-resolver-webpack' to prevent errors like 'react-native not installed
    "import/resolver": {
      webpack: {
        config: "./webpack.dev.config.js",
      },
    },
  },
};
