# Backpack 🎒📱

Android and iOS apps powered via react-native.

## Requirements

- A phone or Simulator (Download XCode)
- At least two terminal windows
- watchman (brew install watchman)

## Quick Start

- Follow [Expo's Installation Instructions](https://docs.expo.dev/get-started/installation/)

  - Make sure this works: `npx expo -h`
  - Make sure you have an account: `npx expo whoami`

- Install [Eas](https://docs.expo.dev/build/setup/#install-the-latest-eas-cli)

```sh
npm install -g eas-cli
```

- In one terminal window, from the _root backpack folder_ run:

```sh
yarn build:mobile && yarn start:mobile
```

- Make sure you see a green screen when navigating to [http://localhost:9333](http://localhost:9333).

This runs our service worker which the mobile app talks to inside src/App.tsx

- In a separate terminal window, from `packages/app-mobile`, run:

```sh
eas build:run -p ios --latest
```

This will download the latest development build. You might need to be added to our EAS account if it doesn't work. You only need to run this once.

Once installed, run:

```
yarn ios
```

An iPhone simulator should open up and you should be well on your way!

If you want to run Android, run:

```sh
yarn android
```

Android emulators don't support running localhost:9333 in your local environment.
It tries to connect to the local phone's server which doesn't exist.

### Troubleshooting

#### I'm stuck on a black screen with a white backpack logo

Potential problems:

- 1. The service worker is not running.
- 2. You're running android and pointing to localhost:9333 which doesn't work

Solutions:

- 1. Verify [http://localhost:9333](http://localhost:9333) has a green background.
     If it's not, run `yarn start:mobile` or in a separate terminal window, `cd packages/background && yarn start`.

- 2. Until we have a better way, go into src/App.tsx and replace `localWebViewUrl` with `remoteWebViewUrl`
     located [here](https://github.com/coral-xyz/backpack/blob/master/packages/app-mobile/src/App.tsx#L132)
     That line should look like this: `const webviewUrl = remoteWebViewUrl`

## service worker readme

Notes based on investigating various issues with WebView on ios, android & our service-worker-loader

- [limitsNavigationsToAppBoundDomains](https://github.com/react-native-webview/react-native-webview/issues/1956) is required. Otherwise, `onMessage` will not fire, both locally and remotely.
- [NSAllowsArbitraryLoads](https://developer.apple.com/documentation/bundleresources/information_property_list/nsapptransportsecurity/nsallowsarbitraryloads) setting this true disables App Transport Security which would allow unsecured HTTP connections. By enabling this you must supply a justification during App Store Review
- [NSExceptionDomains](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html#//apple_ref/doc/uid/TP40009251-SW35) if you allow arbitrary loads, NSExceptionDomains will continue to support ATS
- [WKAppBoundDomains](https://webkit.org/blog/10882/app-bound-domains/) once this is set
- [WKAppBoundDomains order matters](https://bugs.webkit.org/show_bug.cgi?id=227531) it will only load up to 3 service workers and ignore the rest. If there are 5 sites with service workers listed, only 3 of them will fire the service worker. The other 2 will be ignored
