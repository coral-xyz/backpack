module.exports = {
  preset: "jest-puppeteer",
  transform: {
    "^.+\\.[jt]sx?$": ["esbuild-jest"],
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  transformIgnorePatterns: ["node_modules/(?!uuid/)"],
};
