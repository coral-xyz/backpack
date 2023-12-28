import { FlatList } from "react-native";

import { PrimaryButton, XStack, StyledText, Loader } from "@coral-xyz/tamagui";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";

import {
  bluetoothDevicesAtom,
  selectedDeviceIdAtom,
} from "./_atoms/bluetoothDeviceAtoms";
import { QueuedUiRequest } from "../../_atoms/requestAtoms";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";

export function SelectDevice({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest;
}) {
  const bluetoothDevices = useRecoilValue(bluetoothDevicesAtom);
  const rescanDevices = useResetRecoilState(bluetoothDevicesAtom);
  const setSelectedDevice = useSetRecoilState(selectedDeviceIdAtom);
  const numColumns = 1;
  const gap = 8;

  return (
    <RequestConfirmation
      title="Unlock and select your Ledger Device"
      leftButton="Cancel"
      rightButton={
        <PrimaryButton
          label={bluetoothDevices.scanning ? "Scanning..." : "Rescan"}
          onPress={rescanDevices}
        />
      }
      onDeny={() => currentRequest.error(new Error("Cancelled by User"))}
    >
      <FlatList
        numColumns={numColumns}
        data={bluetoothDevices.devices}
        keyExtractor={(item) => item.descriptor.id}
        scrollEnabled={false}
        initialNumToRender={bluetoothDevices.devices.length}
        ListEmptyComponent={<Loader />}
        contentContainerStyle={{ gap }}
        // columnWrapperStyle={{ gap }}
        renderItem={({ item }) => {
          console.log(item);
          return (
            <XStack
              gap="$4"
              borderColor="$borderColor"
              borderRadius="$4"
              margin="$2"
              padding="$4"
              backgroundColor="$background"
              onPress={() => setSelectedDevice(item.descriptor?.id)}
            >
              <StyledText fontWeight="$bold">
                {item?.deviceModel?.productName}
              </StyledText>
              <StyledText>{item?.descriptor?.name}</StyledText>
            </XStack>
          );
        }}
      />
    </RequestConfirmation>
  );
}
