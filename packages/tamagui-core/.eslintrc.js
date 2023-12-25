module.exports = {
  root: true,
  extends: ["custom/native"],
  parserOptions: {
    tsconfigRootDir: __dirname, // eslint-disable-line
    project: ["./tsconfig.eslint.json"],
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        name: "@coral-xyz/app-extension",
        message: "never",
      },
      {
        name: "@coral-xyz/db",
        message: "not even once",
      },
      {
        name: "@coral-xyz/react-common",
        message: "nope ¯|_(ツ)_/¯",
      },
      {
        name: "@coral-xyz/data-components",
        message: "i probably wouldnt",
      },
    ],
  },
};
