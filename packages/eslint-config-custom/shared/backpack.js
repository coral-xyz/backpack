module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        name: "@coral-xyz/app-extension",
        message:
          "dont import app-extension into shared modules bc of build tooling",
      },
      {
        name: "@coral-xyz/app-mobile",
        message:
          "dont import app-mobile into shared modules bc of build tooling",
      },
      {
        name: "@coral-xyz/secure-background",
        message:
          "Don't use/import @coral-xyz/secure-background directly. Use @coral-xyz/secure-ui instead to communicate with secure-background.",
      },
    ],
  },
};
