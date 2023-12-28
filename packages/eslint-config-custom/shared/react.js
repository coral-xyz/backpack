module.exports = {
  parserOptions: { ecmaFeatures: { jsx: true } },
  plugins: ["react", "react-hooks"],
  rules: {
    "react/jsx-boolean-value": ["warn", "never"],
    // "react/jsx-closing-bracket-location": [
    //   "warn",
    //   { nonEmpty: "after-props", selfClosing: "tag-aligned" },
    // ],
    "react/jsx-curly-brace-presence": ["warn", "never"],
    "react/jsx-curly-spacing": ["warn", { when: "never" }],
    "react/jsx-equals-spacing": ["warn", "never"],
    "react/jsx-first-prop-new-line": ["warn", "multiline"],
    "react/jsx-fragments": ["warn", "syntax"],
    "react/jsx-indent": ["warn", 2],
    "react/jsx-indent-props": ["warn", 2],
    "react/jsx-no-bind": [
      "warn",
      { allowArrowFunctions: true, allowFunctions: true },
    ],

    "react/jsx-key": [
      "warn",
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
      },
    ],
    "react/no-array-index-key": "warn",
    "react/jsx-pascal-case": [
      "error",
      { allowLeadingUnderscore: true, ignore: ["__*"] },
    ],
    "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-props-no-multi-spaces": "warn",
    "react/jsx-tag-spacing": "warn",
    "react/jsx-uses-react": "warn",
    "react/jsx-uses-vars": "warn",
    "react/jsx-wrap-multilines": [
      "warn",
      { declaration: false, assignment: false, return: true, arrow: true },
    ],
    "react/no-access-state-in-setstate": "warn",
    "react/no-did-mount-set-state": "warn",
    "react/no-did-update-set-state": "warn",
    "react/no-direct-mutation-state": "warn",
    "react/no-redundant-should-component-update": "warn",
    "react/no-this-in-sfc": "warn",
    "react/no-unknown-property": "warn",
    "react/no-will-update-set-state": "warn",
    "react/require-render-return": "warn",
    "react/self-closing-comp": "warn",

    "react/hook-use-state": ["warn", { allowDestructuredState: true }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks:
          "(useAsyncEffect|useRecoilCallback|useRecoilTransaction_UNSTABLE)",
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@coral-xyz/i18n",
            importNames: ["Trans"],
            message: "use t() instead it will work with variables",
          },
        ],
      },
    ],
  },
  settings: {
    react: { version: "detect" },
  },
};
