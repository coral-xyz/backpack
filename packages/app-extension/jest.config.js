module.exports = {
  preset: "jest-puppeteer",
  moduleNameMapper: {
    "^react-native$": "react-native-web",
  },
  transform: {
    "^.+\\.[jt]sx?$": ["esbuild-jest"],
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  transformIgnorePatterns: ["node_modules/(?!uuid/)"],
};
