module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
  ignorePatterns: ["**/*.js"],
  project: ["./tsconfig.eslint.json", "./packages/*/tsconfig.json"],
};
