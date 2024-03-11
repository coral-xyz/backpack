The process of building these files is as follows:
Follow the install steps here:
https://github.com/trezor/trezor-suite/tree/develop/packages/connect-examples/webextension-mv3-sw

Namely:
Clone the `trezor/trezor-suite` repo, then inside it run:

```
    yarn
    yarn build:libs
    yarn workspace @trezor/connect-webextension build
    node packages/connect-examples/update-webextensions-sw.js
    yarn workspace @trezor/connect-iframe build:core-module
```

You'll find the requisite files in `packages/connect-webextension/build`, copy them here
If additional files are necessary, modify the webpack config in `app-extension/webpack.config.js` to include them
