const [IGNORE, WARNING, ERROR] = [0, 1, 2];

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/ban-ts-comment": IGNORE,
    "@typescript-eslint/ban-types": WARNING,
    "@typescript-eslint/consistent-type-imports": IGNORE,
    "@typescript-eslint/explicit-module-boundary-types": IGNORE,
    "@typescript-eslint/no-empty-function": IGNORE,
    "@typescript-eslint/no-explicit-any": IGNORE,
    "@typescript-eslint/no-unused-vars": IGNORE,
    "import/default": WARNING,
    "import/export": WARNING,
    "import/named": WARNING,
    "import/namespace": WARNING,
    "import/no-cycle": WARNING, // TODO: make ERROR once all cycles are removed
    "import/no-unresolved": WARNING,
    "no-async-promise-executor": WARNING,
    "no-undef": IGNORE,
    "no-unused-vars": IGNORE,
    "prefer-const": IGNORE,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
};
