const {
  jsExtensions,
  tsExtensions,
  platformSubextensions,
  computeExpoExtensions,
} = require("./shared/extensions");

const allExtensions = computeExpoExtensions(
  [...jsExtensions, ...tsExtensions],
  platformSubextensions
);

module.exports = {
  extends: [
    "./shared/backpack.js",
    "./shared/core.js",
    "./shared/typescript.js",
    "./shared/react.js",
    // "./shared/prettier.js", // i added extends prettier to core
  ],
  plugins: ["@peterpme/react-native"],
  globals: {
    __DEV__: false,
    Atomics: false,
    ErrorUtils: false,
    FormData: false,
    SharedArrayBuffer: false,
    XMLHttpRequest: false,
    alert: false,
    cancelAnimationFrame: false,
    cancelIdleCallback: false,
    clearImmediate: false,
    clearInterval: false,
    clearTimeout: false,
    fetch: false,
    navigator: false,
    process: false,
    requestAnimationFrame: false,
    requestIdleCallback: false,
    setImmediate: false,
    setInterval: false,
    setTimeout: false,
    window: false,
  },
  settings: {
    "import/extensions": allExtensions,
    "import/resolver": {
      node: { extensions: allExtensions },
    },
  },
  overrides: [
    {
      files: ["*.web.*"],
      env: { browser: true },
    },
  ],
  rules: {
    "no-restricted-properties": [
      "error",
      {
        object: "window",
        property: "open",
      },
      {
        object: "window",
        property: "location",
      },
      {
        object: "BrowserRuntimeExtension",
        property: "closeActiveTab",
      },
    ],
    "no-restricted-globals": [
      "error", // eslint error and not a restricted global
      "confirm",
      "alert",
      "location",
    ],
    "react/forbid-elements": [
      "error",
      {
        forbid: [
          { element: "div", message: "Use <View> from react-native" },
          { element: "span", message: "Use <Text> from react-native" },
          { element: "button", message: "Use ~components/PrimaryButton" },
        ],
      },
    ],
    "react/forbid-component-props": [
      "error",
      {
        forbid: [
          {
            propName: "className",
            message: "use style",
          },
          {
            propName: "onClick",
            message: "use onPress",
          },
        ],
      },
    ],
    "@peterpme/react-native/no-unused-styles": "warn",
    "@peterpme/react-native/split-platform-components": "warn",
    // "react-native/no-inline-styles": "warn",
    // "react-native/no-color-literals": "warn",
    "@peterpme/react-native/no-raw-text": [
      "warn",
      {
        skip: ["SubtextParagraph"],
      },
    ],
    // "react-native/no-single-element-style-arrays": "warn",
  },
};
