module.exports = {
  root: true,
  extends: ["custom/native"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
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
