module.exports = {
  extends: ["./shared/core.js", "./shared/typescript.js", "./shared/react.js"],
  env: { browser: true, commonjs: true },
  plugins: ["mui-unused-classes"],
  rules: {
    "mui-unused-classes/unused-classes": "error",
  },
};
