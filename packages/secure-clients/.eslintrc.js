module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "import/default": "off",
    "import/export": "off",
    "import/named": "off",
    "import/no-namespace": "off",
    "import/no-cycle": "warn",
    "import/no-unresolved": "off",
  },
};
