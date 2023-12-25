module.exports = {
  root: true,
  extends: ["custom/native"],
  parserOptions: {
    tsconfigRootDir: __dirname, // eslint-disable-line
    project: ["./tsconfig.json"],
  },
  rules: {
    "import/default": "off",
    "import/export": "off",
    "import/named": "off",
    "import/no-namespace": "error",
    "import/no-cycle": "warn",
    "import/no-unresolved": "off",
    "import/no-relative-packages": "error",
    "@typescript-eslint/no-unused-vars": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        packageDir: __dirname, // eslint-disable-line
        devDependencies: false,
        optionalDependencies: false,
        // peerDependencies: false,
      },
    ],
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
    ],
  },
};
