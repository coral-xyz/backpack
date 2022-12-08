/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "@coral-xyz/zeus(.*)$": "<rootDir>/../zeus/src/$1",
  },
};
