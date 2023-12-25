module.exports = {
  extends: ["./shared/core.js", "./shared/typescript.js", "./shared/react.js"],
  env: { browser: true, commonjs: true },
  plugins: ["mui-custom"],
  rules: {
    "mui-custom/unused-styles": "warn",
  },
};
