module.exports = {
  root: true,
  extends: ["custom/native"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};
