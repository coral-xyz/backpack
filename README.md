<div align="center">

  <img src="/assets/backpack.png" />

  <h1>Backpack</h1>

  <p>
    <strong>A home for your xNFTs</strong>
  </p>

  <p>
    <a href="https://github.com/coral-xyz/backpack/actions"><img alt="Build Status" src="https://github.com/coral-xyz/backpack/actions/workflows/pull_requests_and_merges.yml/badge.svg" /></a>
    <a href="https://docs.xnft.gg"><img alt="Tutorials" src="https://img.shields.io/badge/docs-tutorials-blueviolet" /></a>
    <a href="https://discord.gg/w9P85Y9yBR"><img alt="Discord Chat" src="https://img.shields.io/badge/chat-discord-blueviolet" /></a>
  </p>
</div>

### Note

- Backpack is in active development, so all APIs are subject to change.
- This code is unaudited. Use at your own risk.
- I repeat. This is not ready for production.

# Table of contents:

- [Installing the Latest Release](#installing-the-latest-release)
- [Developing Locally](#developing-locally)
  - [Pull the code](#pull-the-code)
  - [Temporary preliminary steps](temporary-preliminary-steps)
  - [Install dependencies](install-dependencies)
  - [Build all packages for production](build-all-packages-for-production)
  - [Start packages for development](start-packages-for-development)
  - [Install the development version of the extension](install-the-development-version-of-the-extension)
  - [Optionally install the built extension](optionally-install-the-built-extension)
- [License](#license)

## Installing the Latest Release

If you'd like to install the latest dev release, grab the latest **build.zip** [here](https://github.com/coral-xyz/backpack/releases)
and add it to your local chrome profile, using developer mode. See the video below.

## Developing Locally

https://user-images.githubusercontent.com/101902546/173857300-fc139113-0af5-46fc-baad-236a2ebf63f1.m4p

### Pull the code

```bash
git clone git@github.com:coral-xyz/backpack.git
cd backpack
git submodule init
git submodule update
```

### Temporary preliminary steps

#### Enable self-signed local SSL certs

Go to chrome://flags/#allow-insecure-localhost and enable the toggle, then restart chrome. Note: Please don't enable this if you don't know what you're doing. It will leave you vulnerable to exploits if left on. It is recommended to undo this step when you are done developing.

#### Environment variables

You can also optionally rename `.env.example` to `.env` and set your own variables.

### Install dependencies

```bash
yarn install
```

### Build all packages for production

```bash
yarn build
```

### Start packages for development

```bash
yarn start
```

Note: In a fresh repo, you should run `yarn build` before `yarn start`.

_If you run into issues with builds try running `yarn clean` and then start again._

### Install the development version of the extension

Go to chrome://extensions, enable developer mode (top right) and drag the `packages/app-extension/dev` dir into the window. This version will have (Dev) in the title and supports live-reloading.

#### Not seeing the dev folder?

- Do you have a stale node process running? Try to kill it all: `killall -9 node` and start over
- Try running `yarn start` from within `packages/app-extension` while running `yarn start` from root. This should work.

### Optionally install the built extension

If you want to try the production build of the extension, run `yarn build` and drag the `packages/app-extension/build` dir into chrome://extensions as above. This version won't have hot-reloading and local plugins won't be visible unless you also run `yarn start`

## License

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you shall be licensed at the discretion of the repository maintainers without any additional terms or conditions.
