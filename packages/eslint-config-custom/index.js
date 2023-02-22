module.exports = {
  root: true,
  extends: [
    "./shared/react.js",
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
    "@typescript-eslint/no-floating-promises": [
      "warn",
      {
        ignoreIIFE: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-non-null-assertion": "off",
    "import/default": "off",
    "import/export": "off",
    "import/named": "off",
    "import/namespace": "off",
    "import/no-cycle": "off",
    "import/no-unresolved": "off",
    "no-async-promise-executor": "off",
    "no-undef": "off",
    "no-unused-vars": "off",
    "prefer-const": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
    "no-case-declarations": "off",
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/consistent-type-exports": [
      "warn",
      {
        fixMixedExportsWithInlineTypeSpecifier: true,
      },
    ],
    "simple-import-sort/imports": [
      "warn",
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
    "simple-import-sort/exports": "warn",
  },

  // https://eslint.org/docs/latest/user-guide/configuring/ignoring-code#the-eslintignore-file
  ignorePatterns: ["dist/*", "build/*", "dev/*", "node_modules/**"],
  parserOptions: {
    ecmaVersion: 2020,
    // "sourceType": "module",
    project: "./tsconfig.json",
  },
};
