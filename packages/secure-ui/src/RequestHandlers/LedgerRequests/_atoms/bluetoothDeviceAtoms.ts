import { PermissionsAndroid, Platform } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { atom, atomFamily, DefaultValue, selector } from "recoil";

type Subscription = ReturnType<typeof TransportBLE.listen>;

type Device = {
  descriptor: {
    id: string;
    name: string;
  };
  deviceModel: {
    productName: string;
  };
};

type BluetoothDevicesAtom = {
  scanning: boolean;
  bleAvailable: boolean;
  error: any;
  devices: Device[];
};

const defaultValue = {
  scanning: false,
  bleAvailable: false,
  devices: [],
  error: null,
};

export const selectedDeviceIdAtom = atom<string | null>({
  key: "selectedDeviceIdAtom",
  default: null,
});

export const bluetoothDevicesAtom = atom<BluetoothDevicesAtom>({
  key: "bluetoothDevicesAtom",
  default: defaultValue,
  dangerouslyAllowMutability: true,
  effects: [
    ({ onSet, setSelf }) => {
      let subscription: Subscription | undefined;
      let subscriptionBLE: Subscription | undefined;

      let requestPermissions: Promise<any> = Promise.resolve();
      if (Platform.OS === "android") {
        requestPermissions = requestPermissions.then(() =>
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
          )
        );
      }

      const observer = {
        complete: () => {
          setSelf((value) => {
            return {
              ...(value instanceof DefaultValue ? defaultValue : value),
              scanning: false,
            };
          });
        },
        next: (e: any) => {
          if (e.type === "add") {
            setSelf((value) => {
              if (value instanceof DefaultValue) {
                return {
                  ...defaultValue,
                  devices: [e],
                };
              }
              return {
                ...(value instanceof DefaultValue ? defaultValue : value),
                devices: [...(value?.devices ?? []), e],
              };
            });
          }
          // NB there is no "remove" case in BLE.
        },
        error: (error: any) => {
          console.error(error);
          setSelf((value) => {
            return {
              ...(value instanceof DefaultValue ? defaultValue : value),
              error,
              scanning: false,
            };
          });
        },
      };

      function startScan() {
        requestPermissions.then(() => {
          setSelf({
            ...defaultValue,
            scanning: true,
          });
          subscription?.unsubscribe();
          subscription = TransportBLE.listen(observer);
        });
      }

      onSet((_, __, isReset) => {
        if (isReset) {
          startScan();
        }
      });

      startScan();

      return () => {
        subscriptionBLE?.unsubscribe();
        subscriptionBLE = undefined;
        subscription?.unsubscribe();
        subscription = undefined;
      };
    },
  ],
});

// export const deviceBlockchainWallets = atomFamily<{
//   [derivationPathGroup: string]: {
//     [derivationPath: string]: string
//   }
// } | null, { blockchain: Blockchain, deviceId: string }>({
//   key: "bluetoothDevicesAtom",
//   default: null,
//   dangerouslyAllowMutability: true,
//   effects: ({ blockchain, deviceId }) => [
//     ({ onSet, setSelf, getPromise }) => {

//       Promise.all([
//         getPromise(blockchainConfigAtom(blockchain))
//       ])
//         .then(async ([blockchainConfig]) => {
//           const transport = await TransportBLE.open(deviceId);
//           const App = blockchain === Blockchain.ETHEREUM ? AppEth : AppSol;
//           const app = new App(transport);

//           app.getAddress
//         })

//       return () => {

//       };
//     }
//   ]
// })

// export const deviceBlockchainWallets = atomFamily<{
//   [derivationPathGroup: string]: {
//     [derivationPath: string]: string
//   }
// } | null, { blockchain: Blockchain, deviceId: string }>({
//   key: "bluetoothDevicesAtom",
//   default: null,
//   dangerouslyAllowMutability: true,
//   effects: ({ blockchain, deviceId }) => [
//     ({ onSet, setSelf, getPromise }) => {

//       Promise.all([
//         getPromise(blockchainConfigAtom(blockchain))
//       ])
//         .then(async ([blockchainConfig]) => {
//           const transport = await TransportBLE.open(deviceId);
//           const App = blockchain === Blockchain.ETHEREUM ? AppEth : AppSol;
//           const app = new App(transport);

//           app.getAddress
//         })

//       return () => {

//       };
//     }
//   ]
// });
