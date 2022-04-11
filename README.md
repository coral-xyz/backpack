# Anchor Wallet

## Local Development

#### 0. Temporary preliminary step

Ensure that an Anchor Wallet compatible `@solana/wallet-adapter-wallets` has been `yarn link`ed.

Check the [.github/workflows/pull_request.yml](.github/workflows/pull_request.yml) for an example of how to do that.

#### 1. Install dependencies

`yarn install`

#### 2. Start the [browser extension](packages/extension) and [example client](packages/example-client) simultaneously

`yarn start`

_If you run into issues with builds try running `yarn clean` and then start again._

## Packages

### [Browser Extension](packages/extension)

`yarn start:wallet`

The chrome browser extension

### [Example Client](packages/example-client)

`yarn start:client`

A react app that can interact with the browser extension

## License

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you shall be licensed at the discretion of the repository maintainers without any additional terms or conditions.
