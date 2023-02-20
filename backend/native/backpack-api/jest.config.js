/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "@coral-xyz/zeus(.*)$": "<rootDir>/../zeus/src/$1",
    "@coral-xyz/common-public(.*)$":
      "<rootDir>/../../../packages/common-public/src/$1",
    "@coral-xyz/common(.*)$": "<rootDir>/../../../packages/common/src/$1",
  },
};
