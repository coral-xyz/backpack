# Backpack

## Installing the Latest Release

If you'd like to install the latest dev release, grab the latest **build.zip** [here](https://github.com/coral-xyz/backpack/releases)
and add it to your local chrome profile, using developer mode. See the video below.

## Developing Locally

https://user-images.githubusercontent.com/101902546/173857300-fc139113-0af5-46fc-baad-236a2ebf63f1.m4p

### 0. Temporary preliminary steps

#### Enable self-signed local SSL certs

Go to chrome://flags/#allow-insecure-localhost and enable the toggle, then restart chrome

#### Link local wallet-adapter

<details>
  <summary>Ensure that Backpack-compatible @solana/wallet-adapter-wallets has been yarn link'd</summary>

```
git clone https://github.com/coral-xyz/wallet-adapter
cd wallet-adapter
yarn
export NODE_OPTIONS=--no-experimental-fetch
yarn build
npx lerna exec -- yarn link
```
</details>

#### Environment variables

You can also optionally rename `.env.example` to `.env` and set your own variables.

### 1. Install dependencies

`yarn install`

### 2. Start all the relevent packages simultaneously

`yarn start`

_If you run into issues with builds try running `yarn clean` and then start again._

### 3a. Install the development version of the extension

Go to chrome://extensions, enable developer mode (top right) and drag the `packages/extension/dev` dir into the window. This version will have (Dev) in the title and supports live-reloading.

### 3b. Optionally install the built extension

If you want to try the production build of the extension, run `yarn build` and drag the `packages/extension/build` dir into chrome://extensions as above. This version won't have hot-reloading and local plugins won't be visible unless you also run `yarn start`

## License

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you shall be licensed at the discretion of the repository maintainers without any additional terms or conditions.
