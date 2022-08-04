// This is a WIP, running eslint for the whole monorepo causes
// javascript to run out of memory, so it needs a bit of refinement
module.exports = {
  // extends: [
  //   "eslint:recommended",
  //   "plugin:@typescript-eslint/recommended",
  //   "plugin:@typescript-eslint/recommended-requiring-type-checking",
  //   "plugin:react/recommended",
  // ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
    // project: ["./tsconfig.json", "./packages/**/tsconfig.json"],
  },
  // plugins: ["@typescript-eslint", "react", "only-warn"],
  root: true,
  settings: {
    react: {
      version: "detect",
    },
  },
};
