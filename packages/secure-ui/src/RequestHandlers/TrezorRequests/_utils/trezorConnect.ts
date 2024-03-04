import TrezorConnect from "@trezor/connect-web";

TrezorConnect.init({
  manifest: {
    email: "samuel.sulovsky@vacuumlabs.com",
    appUrl: "https://backpack.app/",
  },
  lazyLoad: true,
});

export default TrezorConnect;
