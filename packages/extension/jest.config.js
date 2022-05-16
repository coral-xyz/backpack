module.exports = {
  preset: "jest-puppeteer",
  transform: {
    "^.+\\.tsx?$": ["esbuild-jest"],
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
};
