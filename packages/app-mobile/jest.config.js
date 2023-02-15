module.exports = {
  // rootDir: "../../",
  // roots: ["<rootDir>/packages/app-mobile"],
  preset: "jest-expo",
  resolver: "<rootDir>/resolver.js",
  moduleNameMapper: {
    "^uuid$": require.resolve("uuid"),
    "^expo-modules-core$": require.resolve("expo-modules-core"),
    "^@solana/spl-token$": require.resolve("@solana/spl-token"),
    "^parse5-htmlparser2-tree-adapter$": require.resolve(
      "parse5-htmlparser2-tree-adapter"
    ),
    "^parse5$": require.resolve("parse5"),
  },
  // modulePaths: [
  //   "<rootDir>/node_modules",
  //   "<rootDir>/packages/app-mobile/node_modules",
  // ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|base32-encode|to-data-view|recoil)",
  ],
};
