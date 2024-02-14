const eslint = require("eslint");
const rule = new eslint.Linter().getRules().get("no-restricted-imports");
module.exports = rule;
