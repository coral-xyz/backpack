# Anchor Wallet

## Local Development

#### 0. Temporary preliminary step

Ensure that an Anchor Wallet compatible `@solana/wallet-adapter-wallets` and `@project-serum/anchor` have been `yarn link`ed.

run `yarn && yarn build` from root of `@solana/wallet-adapter-wallets`.

Check the [.github/workflows/pull_request.yml](.github/workflows/pull_request.yml) for an example of how to do that.

You can also optionally rename `.env.example` to `.env` and set your own variables.

#### 1. Install dependencies

`yarn install`

#### 2. Start the [browser extension](packages/extension) and [example client](packages/example-client) simultaneously

`yarn start`

_If you run into issues with builds try running `yarn clean` and then start again._

## License

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you shall be licensed at the discretion of the repository maintainers without any additional terms or conditions.
