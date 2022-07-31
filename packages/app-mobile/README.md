# running locally

`npm i -g expo-cli`

`xcode-select --install`

## run background service worker

ensure the background serviceworker wrapper html is running on http://localhost:9333, either `yarn start` from root or `cd ../background && yarn start`

install [ngrok](https://ngrok.com/download) or something similar to forward http://localhost:9333 to an external https:// url

` brew install ngrok/ngrok/ngrok`

start the forwarding service

`ngrok http 9333`

copy the URL and set it as `WEBWORKER_URL` in env

`WEBWORKER_URL=https://theForwardingUrlFromAbove yarn android`

^ if this doesn't open XCode's iPhone simulator you might need to install XCode from the Mac App Store and then try again.
