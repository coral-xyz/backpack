import {
  useNavigation,
  View,
  TextField,
  Image,
  Text,
  ScrollBar,
  Button,
} from "react-xnft";
import React, { useState } from "react";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import getGatewayUri from "./_utils/getGatewayUri";
import { XnftWithMetadata } from "./_types/XnftWithMetadata";
import Rating from "./Rating";

function AppDetails({ app }: { app: XnftWithMetadata }) {
  return (
    <>
      <View tw="flex gap-6 m-4">
        <Image
          tw="col-span-1 rounded-lg h-[120px] w-[120px]"
          src={getGatewayUri(app.json.image)}
        />
        <View tw="flex flex-col items-start gap-4">
          <View tw="flex items-center gap-4">
            {/* <AppPrimaryButton
            tw="bg-[#4F46E5] text-white"
            disabled={!connected}
            installed={isInstalled}
            loading={loading}
            onClick={isInstalled ? handleOpenApp : handleInstall}
            price={priceLamports}
          /> */}

            <Button
              tw="rounded bg-[#27272A] px-3 py-2 text-xs font-medium tracking-wide text-white"
              // onClick={handlePreviewClick}
              // disabled={!connected}
            >
              Install
            </Button>
            <Button
              tw="rounded bg-[#27272A] px-3 py-2 text-xs font-medium tracking-wide text-white"
              // onClick={handlePreviewClick}
              // disabled={!connected}
            >
              Preview
            </Button>
            {app.account.suspended && (
              <Text tw="badge rounded-xl bg-red-400/25 py-1 px-2 text-xs text-red-400">
                suspended
              </Text>
            )}
          </View>

          <View tw="flex items-center gap-4">
            {/* <Text tw="text-3xl font-semibold tracking-wide text-white">{app.json.name}</Text> */}
            <Text tw="rounded-2xl bg-[#4F46E5] px-3 py-1 text-xs font-medium tracking-wide text-white">
              {app.account.totalInstalls.toNumber()} Downloads
            </Text>
          </View>
          <Rating app={app} starSize={16} />
        </View>
      </View>
      <View tw="m-4 max-w-md text-lg font-medium text-[#99A4B4]">
        {app.json.description}
      </View>
    </>
  );
}

export default AppDetails;
