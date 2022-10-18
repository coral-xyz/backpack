const [IGNORE, WARNING, ERROR] = [0, 1, 2];

module.exports = {
  root: true,
  extends: [
    // "turbo",
    // "prettier",
    // "plugin:workspaces/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  plugins: [
    // "workspaces",
    "@typescript-eslint",
    "simple-import-sort",
    "mui-unused-classes",
  ],
  rules: {
    "mui-unused-classes/unused-classes": "error",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "import/default": "off",
    "import/export": "off",
    "import/named": "off",
    "import/namespace": "off",
    "import/no-cycle": "warn",
    "import/no-unresolved": "off",
    "no-async-promise-executor": "off",
    "no-undef": "off",
    "no-unused-vars": "off",
    "prefer-const": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
    "no-case-declarations": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/consistent-type-exports": [
      "error",
      {
        fixMixedExportsWithInlineTypeSpecifier: true,
      },
    ],
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
    "simple-import-sort/exports": "error",
  },
  // settings: {
  //   "import/resolver": {
  //     typescript: {},
  //   },
  // },
  // settings: {
  //   "import/resolver": {
  //     node: {
  //       extensions: [".js", ".jsx", ".ts", ".tsx"],
  //     },
  //   },
  // },

  ignorePatterns: ["dist/*"],
  parserOptions: {
    ecmaVersion: 2020,
    // "sourceType": "module",
    project: "./tsconfig.json",
  },
};

// // This is a WIP, running eslint for the whole monorepo causes
// // javascript to run out of memory, so it needs a bit of refinement
// module.exports = {
//   // extends: [
//   //   "eslint:recommended",
//   //   "plugin:@typescript-eslint/recommended",
//   //   "plugin:@typescript-eslint/recommended-requiring-type-checking",
//   //   "plugin:react/recommended",
//   // ],
//   parser: "@typescript-eslint/parser",
//   parserOptions: {
//     ecmaVersion: "latest",
//     sourceType: "module",
//     tsconfigRootDir: __dirname,
//     // project: ["./tsconfig.json", "./packages/**/tsconfig.json"],
//   },
//   // plugins: ["@typescript-eslint", "react", "only-warn"],
//   root: true,
//   settings: {
//     react: {
//       version: "detect",
//     },
//   },
// };
