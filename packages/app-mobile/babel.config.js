process.env.TAMAGUI_TARGET = "native"; // Don't forget to specify your TAMAGUI_TARGET here

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "relay",
      [
        "@tamagui/babel-plugin",
        {
          // exclude: /node_modules/,
          components: ["@coral-xyz/tamagui", "tamagui"],
          config: "./tamagui.config.ts",
        },
      ],
      [
        "transform-inline-environment-variables",
        {
          include: "TAMAGUI_TARGET",
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
