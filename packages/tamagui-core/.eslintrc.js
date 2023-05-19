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
        message: "pls ser... think of the children",
      },
      {
        name: "@coral-xyz/app-mobile",
        message: "pls ser... think of the children",
      },
      {
        name: "@coral-xyz/db",
        message: "not even once",
      },
      {
        name: "@coral-xyz/recoil",
        message: "don't even bother",
      },
    ],
  },
};
