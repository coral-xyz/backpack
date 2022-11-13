import {
  useNavigation,
  View,
  TextField,
  Image,
  Text,
  ScrollBar,
} from "react-xnft";
import React, { useState } from "react";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import FilterIcon from "./FilterIcon";
import filteredXnftsAtom from "./_atoms/filteredXnftsAtom";
import xnftsAtom from "./_atoms/xnftsAtom";
import getGatewayUri from "./_utils/getGatewayUri";
import { XnftWithMetadata } from "./_types/XnftWithMetadata";

function AppList() {
  const xnfts = useRecoilValueLoadable(filteredXnftsAtom);
  const [filter, setFilter] = useState<string>("");
  // const nav = useNavigation();

  if (xnfts.state !== "hasValue") {
    return null;
  }

  let filteredList = xnfts.contents;

  if (filter !== "") {
    const regex = new RegExp(filter, "i");
    filteredList = filteredList.filter(
      (app) => regex.test(app.json.name) || regex.test(app.json.description)
    );
  }

  return (
    <View tw="flex flex-col h-full py-3 cursor-pointer">
      <View tw="flex flex-row px-4 pb-3">
        <View tw="flex-1">
          <TextField
            placeholder="Search all apps"
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            value={filter}
          />
        </View>
        <View tw="pl-4 flex justify-center items-center">
          <FilterIcon size={32} color={"white"} />
        </View>
      </View>
      <View tw="flex flex-row px-4 pb-3 bg-[#27272A]"></View>
      <View tw="flex-1">
        <ScrollBar>
          {filteredList &&
            filteredList.map((app) => (
              <RenderApp key={app.publicKey.toString()} app={app} />
            ))}
        </ScrollBar>
      </View>
    </View>
  );
}

function RenderApp({ app }: { app: XnftWithMetadata }) {
  return (
    <View tw="flex items-center gap-4 rounded-lg bg-[#27272A] m-4 p-4 shadow-lg transition-all hover:-translate-y-0.1 hover:bg-[#27272A]/40">
      <View tw="flex items-center">
        <Image
          tw="rounded-lg"
          src={getGatewayUri(app.json.image)}
          style={{
            height: "64px",
            width: "64px",
          }}
        />
      </View>
      <View tw="min-w-0 flex-1">
        <View tw="truncate font-bold tracking-wide text-white">
          {app.account.name}
        </View>
        <View tw="truncate text-xs tracking-wide text-[#FAFAFA]/75">
          {app.json.description}
        </View>
      </View>
      {/* <View tw="my-auto">
      <AppPrimaryButton
        disabled={!connected}
        installed={installed}
        loading={loading}
        onClick={onButtonClick}
        price={price}
      />
    </View> */}
    </View>
  );
}

export default AppList;
