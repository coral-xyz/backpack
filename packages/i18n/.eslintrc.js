module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    tsconfigRootDir: __dirname,
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
        name: "@coral-xyz/app-mobile",
        message: "never",
      },
      {
        name: "@coral-xyz/db",
        message: "not even once",
      },
      {
        name: "@coral-xyz/recoil",
        message: "not worth it",
      },
      {
        name: "@coral-xyz/react-common",
        message: "nope ¯|_(ツ)_/¯",
      },
    ],
  },
};
