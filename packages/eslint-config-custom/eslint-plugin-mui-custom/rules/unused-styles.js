// from https://github.com/jens-ox/eslint-plugin-material-ui-unused-classes/blob/main/rule.js

function getBasicIdentifier(node) {
  if (node.type === "Identifier") {
    // classes.foo
    return node.name;
  }

  if (node.type === "Literal") {
    // classes['foo']
    return node.value;
  }

  if (node.type === "TemplateLiteral") {
    // classes[`foo`]
    if (node.expressions.length) {
      // classes[`foo${bar}`]
      return null;
    }
    return node.quasis[0].value.raw;
  }

  // Might end up here with things like:
  // classes['foo' + bar]
  return null;
}

module.exports = {
  meta: {
    type: "problem",
  },
  create: function rule(context) {
    const definedClasses = {};
    const potentialUses = [];
    let hookName = "";
    let instanceName = "";

    return {
      CallExpression(node) {
        if (
          node.callee.name === "temporarilyMakeStylesForBrowserExtension" &&
          node.parent.type === "VariableDeclarator"
        ) {
          hookName = node.parent.id.name;
          const styles = node.arguments[0];

          if (styles && styles.type === "ArrowFunctionExpression") {
            const { body } = styles;

            let stylesObj;
            if (body.type === "ObjectExpression") {
              stylesObj = body;
            } else if (body.type === "BlockStatement") {
              body.body.forEach((bodyNode) => {
                if (
                  bodyNode.type === "ReturnStatement" &&
                  bodyNode.argument.type === "ObjectExpression"
                ) {
                  stylesObj = bodyNode.argument;
                }
              });
            } else if (
              body.type === "CallExpression" &&
              body.callee.name === "createStyles" &&
              body.arguments[0].type === "ObjectExpression"
            ) {
              stylesObj = body.arguments[0];
            }

            if (stylesObj) {
              stylesObj.properties.forEach((property) => {
                if (property.computed) {
                  // Skip over computed properties for now.
                  // e.g. `{ [foo]: { ... } }`
                  return;
                }

                if (
                  property.type === "ExperimentalSpreadProperty" ||
                  property.type === "SpreadElement"
                ) {
                  // Skip over object spread for now.
                  // e.g. `{ ...foo }`
                  return;
                }
                definedClasses[property.key.name] = property;
              });
            }
          }
        }
        if (hookName !== "" && node.callee.name === hookName) {
          instanceName = node.parent.id.name;
        }
      },

      MemberExpression(node) {
        if (node.object.type === "Identifier") {
          const whichClass = getBasicIdentifier(node.property);
          if (whichClass) {
            potentialUses.push({
              instanceName: node.object.name,
              whichClass,
            });
          }
          return;
        }

        const classIdentifier = getBasicIdentifier(node.property);
        if (!classIdentifier) {
          // props['foo' + bar].baz
          return;
        }

        const { parent } = node;

        if (parent.type !== "MemberExpression") {
          // foo.styles
          return;
        }

        if (
          node.object.object &&
          node.object.object.type !== "ThisExpression"
        ) {
          // foo.foo.styles
          return;
        }

        const propsIdentifier = getBasicIdentifier(parent.object);
        if (propsIdentifier && propsIdentifier !== "props") {
          return;
        }
        if (!propsIdentifier && parent.object.type !== "MemberExpression") {
          return;
        }

        if (parent.parent.type === "MemberExpression") {
          // this.props.props.styles
          return;
        }

        const parentClassIdentifier = getBasicIdentifier(parent.property);
        if (parentClassIdentifier) {
          potentialUses.push({
            instanceName: node.object.name,
            whichClass: parentClassIdentifier,
          });
        }
      },
      "Program:exit": () => {
        const confirmedUses = potentialUses
          .filter((p) => p.instanceName === instanceName)
          .map((p) => p.whichClass);
        // Now we know all of the defined classes and used classes, so we can
        // see if there are any defined classes that are not used.
        Object.keys(definedClasses).forEach((definedClassKey) => {
          if (!confirmedUses.includes(definedClassKey)) {
            context.report(
              definedClasses[definedClassKey],
              `Class \`${definedClassKey}\` is unused`
            );
          }
        });
      },
    };
  },
};
