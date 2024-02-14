module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "React hooks should not start with underscores",
      recommended: false,
    },
    schema: [],
  },
  create: function (context) {
    return {
      // Check function declarations
      FunctionDeclaration: function (node) {
        if (isHook(node.id) && node.id.name.startsWith("_use")) {
          context.report({
            node,
            message: "React hooks should not start with an underscore",
          });
        }
      },
      // Check function expressions
      VariableDeclarator: function (node) {
        if (isHook(node.id) && node.id.name.startsWith("_use")) {
          context.report({
            node,
            message: "React hooks should not start with an underscore",
          });
        }
      },
    };
  },
};

// Helper function to check if a string is a hook name
function isHookName(s) {
  return /^use[A-Z0-9].*$/.test(s);
}

// Function to determine if a node is a hook
function isHook(node) {
  if (node.type === "Identifier") {
    return isHookName(node.name);
  } else if (
    node.type === "MemberExpression" &&
    !node.computed &&
    isHook(node.property)
  ) {
    const obj = node.object;
    return obj.type === "Identifier" && obj.name === "React";
  } else {
    return false;
  }
}
