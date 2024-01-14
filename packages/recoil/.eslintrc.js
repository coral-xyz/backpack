module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        name: "@coral-xyz/app-extension",
        message: "pls ser... think of the children",
      },
      {
        name: "@coral-xyz/secure-ui",
        message: "pls ser... think of the children",
      },
      {
        name: "@coral-xyz/app-mobile",
        message: "pls ser... think of the children",
      },
    ],
  },
};
