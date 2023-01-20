module.exports = {
  root: true,
  extends: ["custom/native"],
  // overrides: [
  //   {
  //     files: ["*.ts", "*.tsx", "*.d.ts"],
  //     parserOptions: {
  //       project: "./tsconfig.json",
  //     },
  //   },
  // ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};
