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
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/\\d+(px|vh|vw|rem|pt|em)$/]",
        message: "Units like px, vh, etc don't work. Use unitless instead",
      },
    ],
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
          { element: "div", message: "Use {Stack,YStack,XStack} from tamagui" },
          { element: "span", message: "Use StyledText from tamagui" },
          { element: "button", message: "Use PrimaryButton from tamagui" },
        ],
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@apollo/client",
            importNames: ["gql"],
            message:
              "Please import 'gql' from '~/src/graphql/__generated__' instead.",
          },
          {
            name: "@coral-xyz/i18n",
            importNames: ["Trans"],
            message: "use t() instead it will work with variables",
          },
          {
            name: "tamagui",
            importNames: ["SizableText"],
            message: "StyledText from @coral-xyz/tamagui",
          },
          {
            name: "tamagui",
            importNames: ["Image"],
            message: "Image from expo-image",
          },
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
          {
            propName: "display",
            message: "display:flex is the default",
          },
          {
            propName: "style",
            disallowedFor: ["StyledText"],
            message: "use perf-optimized tamagui props instead",
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
        skip: [
          "SubtextParagraph",
          "StyledText",
          "ListItemStyledText",
          "_Label",
          "Button",
        ],
      },
    ],
    // "react-native/no-single-element-style-arrays": "warn",
    "import/no-extraneous-dependencies": [
      "error",
      {
        // packageDir: __dirname, // eslint-disable-line
        devDependencies: false,
        optionalDependencies: false,
        // peerDependencies: false,
      },
    ],
  },
};
