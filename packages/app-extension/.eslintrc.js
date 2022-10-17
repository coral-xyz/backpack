const [IGNORE, WARNING, ERROR] = [0, 1, 2];

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "mui-unused-classes", "simple-import-sort"],
  rules: {
    "mui-unused-classes/unused-classes": WARNING,
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
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // Packages `react` related packages come first.
          ["^react", "^@?\\w"],
          // Internal packages.
          ["^(@|components)(/.*|$)"],
          // Side effect imports.
          ["^\\u0000"],
          // Parent imports. Put `..` last.
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Other relative imports. Put same-folder imports and `.` last.
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // Style imports.
          ["^.+\\.?(css)$"],
        ],
      },
    ],
    "simple-import-sort/exports": ERROR,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
};
