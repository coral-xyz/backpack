module.exports = {
  preset: "jest-puppeteer",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  transformIgnorePatterns: ["node_modules/(?!uuid/)"],
  fakeTimers: {
    legacyFakeTimers: true,
  },
};
