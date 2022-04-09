module.exports = {
  preset: "jest-puppeteer",
  transform: {
    "^.+\\.tsx?$": ["esbuild-jest"],
  },
};
