# anchor-wallet

## Developing

### Install Dependencies

To install dependencies, run

```shell
yarn
```

### Run Development Server

To start the development server, run

```shell
yarn start
```

This will place the build artifacts in the `dev/` directory and will hot reload the extension ui and background script on file change.
Note that the content and injected scripts won't be hot reloaded and must be manually loaded.

### Build for Production

Alternatively, you can build for production by running

```shell
yarn build
```

which will place the bulid artifacts in the `build/` directory.

### Install the Extension

After building via `yarn start` or `yarn build`, you can install the extension locally by opening chrome and going to the **manage extensions** page,
turning on **developer mode** and clicking **load unpacked**, where you can load the build artifacts above. Once done, optionally pin the extension to your
browser's toolbar and you're good to go.

Note: if run one of the tasks above but get the error `Could not load JavaScript 'contentScript.bundle.js' for content script.`, try waiting for 30s as the build might not yet be fully complete.

## License

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you shall be licensed at the discretion of the repository maintainers without any additional terms or conditions.
