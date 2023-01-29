# Backpack 🎒📱

Android and iOS apps powered via react-native.

## Requirements

- A phone or Simulator (Download XCode)
- At least two terminal windows

## Quick Start

- Install [Expo](https://docs.expo.dev/workflow/expo-cli/)

```sh
npm install -g expo-cli
```

- Install [Eas](https://docs.expo.dev/build/setup/#install-the-latest-eas-cli)

```sh
npm install -g eas-cli
```

- In one terminal window, from the _root backpack folder_ run:

```sh
yarn build:mobile && yarn start:mobile
```

- In another terminal window, from `packages/app-mobile`, run:

```sh
yarn ios
```

An iPhone simulator should open up and you should be well on your way!
