module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Require operationName",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
    messages: {
      missingOperationName:
        "Missing { operationName: string } as second argument",
      invalidOperationName: "Invalid operationName",
    },
    fixable: "code",
  },

  create(context) {
    function getFunctionName(node) {
      if (!node) {
        return null;
      }
      if (node.type === "FunctionDeclaration") {
        return node.id && node.id.name;
      } else if (
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        if (node.parent.type === "VariableDeclarator") {
          return node.parent.id.name;
        } else if (node.parent.type === "AssignmentExpression") {
          return node.parent.left.property.name;
        }
      }
      return null;
    }

    return {
      CallExpression(node) {
        if (
          node.callee.name === "chain" &&
          node.arguments[0].type === "Literal" &&
          ["query", "mutation"].includes(node.arguments[0].value) &&
          node.parent.arguments.length >= 1
        ) {
          const [operationNameArgument] = node.parent.arguments
            .map((arg) => {
              return (
                arg.type === "ObjectExpression" &&
                arg.properties.find(
                  (property) =>
                    property.key.name === "operationName" &&
                    property.value.type === "Literal" &&
                    typeof property.value.value === "string"
                )
              );
            })
            .filter(Boolean);

          if (operationNameArgument) {
            if (operationNameArgument.value?.value?.match(/[^a-z]/i)) {
              context.report({
                node: operationNameArgument,
                messageId: "invalidOperationName",
              });
            }
          } else {
            context.report({
              node,
              messageId: "missingOperationName",
              fix(fixer) {
                const functionName = getFunctionName(
                  context
                    .getAncestors()
                    .filter(Boolean)
                    .find(
                      (ancestor) =>
                        ancestor.type === "FunctionDeclaration" ||
                        ancestor.type === "FunctionExpression" ||
                        ancestor.type === "ArrowFunctionExpression"
                    )
                );

                if (functionName) {
                  if (node.parent.arguments.length === 1) {
                    return fixer.insertTextAfter(
                      node.parent.arguments[0],
                      `, { operationName: "${functionName}" }`
                    );
                  } else if (node.parent.arguments.length === 2) {
                    return fixer.replaceText(
                      node.parent.arguments[1],
                      ` { operationName: "${functionName}" }`
                    );
                  }
                }
                return null;
              },
            });
          }
        }
      },
    };
  },
};
