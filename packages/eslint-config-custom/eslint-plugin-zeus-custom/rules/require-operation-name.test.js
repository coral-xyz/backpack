const { RuleTester } = require("eslint");

const rule = require("./require-operation-name");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
  },
});

ruleTester.run("require-operation-name", rule, {
  valid: [
    {
      code: `
        async function getUser(id) {
          const response = await chain("mutation")({}, { operationName: "getUser" });
          return response;
        }
      `,
    },
    {
      code: `
        chain("mutation")({}, { operationName: "someOperation" });
      `,
    },
  ],
  invalid: [
    {
      code: `
        async function getUser(id) {
          const response = await chain("mutation")({});
          return response;
        }
      `,
      errors: [
        {
          message: "Missing { operationName: string } as second argument",
        },
      ],
      output: `
        async function getUser(id) {
          const response = await chain("mutation")({}, { operationName: "getUser" });
          return response;
        }
      `,
    },
    {
      code: `
        (async function() {
          const response = await chain("mutation")({}, {});
        })();
      `,
      errors: [
        {
          message: "Missing { operationName: string } as second argument",
        },
      ],
      output: `
        (async function() {
          const response = await chain("mutation")({}, {});
        })();
      `,
    },
    {
      code: `
        (async function() {
          const response = await chain("mutation")({}, { operationName: "hello world" });
        })();
      `,
      errors: [
        {
          message: "Invalid operationName",
        },
      ],
    },
    {
      code: `
        chain("query")({ foo: "bar" }).then(console.log);
      `,
      errors: [
        {
          message: "Missing { operationName: string } as second argument",
        },
      ],
    },
  ],
});
