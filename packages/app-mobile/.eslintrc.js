module.exports = {
  root: true,
  extends: ["custom/native"],
  parserOptions: {
    tsconfigRootDir: __dirname, // eslint-disable-line
    project: ["./tsconfig.eslint.json", "./tsconfig.json"],
  },
};
