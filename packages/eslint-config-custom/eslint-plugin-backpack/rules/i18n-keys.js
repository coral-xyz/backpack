module.exports = {
  create: (context) => ({
    CallExpression(node) {
      if (node.callee.name === "t") {
        check(node.arguments[0], context);
      }
    },
    MemberExpression(node) {
      if (node.property.name === "t") {
        if (!node.parent.arguments) {
          return;
        }
        check(node.parent.arguments[0], context);
      }
    },
    JSXAttribute(node) {
      if (node.name.name === "i18nKey") {
        check(node.value, context);
      }
    },
  }),
  name: "i18n-keys",
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "Ensures i18n keys are valid",
      recommended: "error",
    },
    schema: [],
  },
  defaultOptions: [],
};

const PLURAL_SUFFIXES = [
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
  "interval",
];

/**
 * Runs all i18n t() translation key rules in a single function for performance.
 * Consider splitting into separate functions if this becomes too complex.
 */
function check(node, context) {
  // RULE 1: Only allow string keys

  if (!node || node.type !== "Literal" || typeof node.value !== "string") {
    context.report({
      node,
      message:
        "Only string literals are allowed as arguments to the t() function.",
    });
  } else {
    PLURAL_SUFFIXES.forEach((suffix) => {
      if (node.value.endsWith(`_${suffix}`)) {
        context.report({
          node,
          message: `String should not end with '_${suffix}', consider {count} instead. See https://www.i18next.com/translation-function/plurals for more info.`,
        });
      }
    });

    if (!node.value.match(/^[a-z0-9]+([_.][a-z0-9]+)*$/)) {
      // RULE 2: Enforce snake_case keys
      context.report({
        node,
        message: `Translation key should be snake_case.`,
      });
    } else if (node.value.split(".").length > 2) {
      // RULE 3: Only allow up to one level of nesting
      context.report({
        node,
        message: `Translation is too deeply nested, use up to one . separator.`,
      });
    }
  }
}
