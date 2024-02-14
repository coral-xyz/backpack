module.exports = {
  plugins: ["@peterpme/react-native", "backpack", "react", "react-hooks"],
  extends: [
    "./shared/backpack.js",
    "turbo",
    "universe",
    "plugin:react/recommended",
  ],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    /*
     * TODO: Turn this block on soon (START)
     * =======================================
     */
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": [
      "off",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    /*
     * TODO: Turn this block on soon (END)
     * =======================================
     */

    "backpack/hooks-should-not-start-with-underscore": "error",
    "backpack/i18n-keys": "error",
    "react/react-in-jsx-scope": "off",
    "no-unreachable": "error",
    "no-empty-pattern": "error",
    "operator-linebreak": "off",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@peterpme/react-native/no-unused-styles": "error",
    "@peterpme/react-native/split-platform-components": "warn",
    "@peterpme/react-native/no-raw-text": [
      "warn",
      {
        skip: [
          "TopLeftText",
          "SubtextParagraph",
          "StyledText",
          "ListItemStyledText",
          "_Label",
          "Button",
        ],
      },
    ],
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/\\d+(px|vh|vw|rem|pt|em)$/]",
        message: "Units like px, vh, etc don't work. Use unitless instead",
      },
      {
        selector: "Literal[value=/(treklabs.xyz|backpack.exchange)/]",
        message: "Use Constants.expoConfig?.extra?.exchange{Api,Base}Url",
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
      {
        object: "theme",
        property: "custom",
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
          {
            name: "@coral-xyz/themes",
            importNames: ["useTheme"],
            message: "useTheme from @coral-xyz/tamagui",
          },
          {
            name: "@coral-xyz/common",
            importNames: ["UI_RPC_METHOD_KEYRING_STORE_UNLOCK"],
            message: "userClient.unlockKeyring",
          },
          {
            name: "@coral-xyz/common",
            importNames: ["UI_RPC_METHOD_KEYRING_STORE_UNLOCK"],
            message: "use userClient.unlockKeyring",
          },
          {
            name: "react-native",
            importNames: [
              "TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, Touchable",
            ],
            message: "import from react-native-gesture-handler",
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
  },
};
