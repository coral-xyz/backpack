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
import FilterIcon from "./Icons/FilterIcon";
import filteredXnftsAtom from "./_atoms/filteredXnftsAtom";
import getGatewayUri from "./_utils/getGatewayUri";
import { XnftWithMetadata } from "./_types/XnftWithMetadata";
import appFilterAtom from "./_atoms/appFilterAtom";
import ArrowDownIcon from "./Icons/ArrowDownIcon";
import ArrowUpIcon from "./Icons/ArrowUpIcon";
import CircleUnchecked from "./Icons/CircleUnchecked";
import CircleChecked from "./Icons/CircleChecked";
import Rating from "./Rating";
import InstallIcon from "./Icons/InstallIcon";

function AppList() {
  const xnfts = useRecoilValueLoadable(filteredXnftsAtom);
  const [filter, setFilter] = useRecoilState(appFilterAtom);
  const [search, setSearch] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  // const nav = useNavigation();

  if (xnfts.state !== "hasValue") {
    return null;
  }

  let filteredList = xnfts.contents;

  if (search !== "") {
    const regex = new RegExp(search, "i");
    filteredList = filteredList.filter(
      (app) => regex.test(app.json.name) || regex.test(app.json.description)
    );
  }

  return (
    <View tw="flex flex-col h-full py-3">
      <View tw="flex flex-row px-4 pb-3">
        <View tw="flex-1">
          <TextField
            placeholder="Search all apps"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            value={search}
          />
        </View>
        <View
          tw="pl-4 flex justify-center items-center cursor-pointer"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <FilterIcon size={32} color={drawerOpen ? "#33CCFF" : "white"} />
        </View>
      </View>
      <View
        tw={`max-h-[0rem] ${
          drawerOpen ? "max-h-[10rem]" : "max-h-[0rem]"
        } h-auto overflow-hidden transition-[max-height] duration-300 ease-in-out`}
      >
        <View
          tw="p-2 bg-[#27272A]"
          style={{
            boxShadow: "inset 0 0 4px 1px rgba(0,0,0,0.8)",
          }}
        >
          <Text tw="mx-2">Sort By:</Text>
          <View tw="flex-row">
            <SortButton
              label="Rating"
              desc={!!filter.sortDesc}
              active={filter.sortBy === "ratings"}
              onClick={() => {
                if (filter.sortBy !== "ratings") {
                  setFilter({
                    sortBy: "ratings",
                  });
                } else {
                  setFilter({
                    sortDesc: !filter.sortDesc,
                  });
                }
              }}
            />
            <SortButton
              label="Installs"
              desc={!!filter.sortDesc}
              active={filter.sortBy === "installs"}
              onClick={() => {
                if (filter.sortBy !== "installs") {
                  setFilter({
                    sortBy: "installs",
                  });
                } else {
                  setFilter({
                    sortDesc: !filter.sortDesc,
                  });
                }
              }}
            />
            <SortButton
              label="Updated"
              desc={!!filter.sortDesc}
              active={filter.sortBy === "updated"}
              onClick={() => {
                if (filter.sortBy !== "updated") {
                  setFilter({
                    sortBy: "updated",
                  });
                } else {
                  setFilter({
                    sortDesc: !filter.sortDesc,
                  });
                }
              }}
            />
            <SortButton
              label="Created"
              desc={!!filter.sortDesc}
              active={filter.sortBy === "created"}
              onClick={() => {
                if (filter.sortBy !== "created") {
                  setFilter({
                    sortBy: "created",
                  });
                } else {
                  setFilter({
                    sortDesc: !filter.sortDesc,
                  });
                }
              }}
            />
          </View>
          <Text tw="mx-2">Include:</Text>
          <View tw="flex flex-row items-center justify-start">
            <Button
              onClick={() => {
                setFilter({ includeSuspended: !filter.includeSuspended });
              }}
              tw={`${
                filter.includeSuspended
                  ? "text-[#000] font-bold"
                  : "font-medium "
              } inline-flex flex-row m-2 px-3 justify-center items-center rounded text-xs tracking-wide`}
            >
              {filter.includeSuspended ? (
                <CircleChecked tw="m-0 mr-1" size={16} color="black" />
              ) : (
                <CircleUnchecked tw="m-0 mr-1" size={16} color="#71717A" />
              )}
              {"Suspended"}
            </Button>
            <Button
              onClick={() => {
                const includePrice =
                  filter.includePrice === "all"
                    ? "paidOnly"
                    : filter.includePrice === "paidOnly"
                    ? "freeOnly"
                    : "all";
                setFilter({ includePrice });
              }}
              tw={`text-[#000] font-bold inline-flex flex-row m-2 px-3 justify-center items-center rounded text-xs tracking-wide`}
            >
              {filter.includePrice === "all"
                ? "Paid & Free"
                : filter.includePrice === "paidOnly"
                ? "Paid Only"
                : "Free Only"}
            </Button>
            <Button
              onClick={() => {
                setFilter({ includeInstalled: !filter.includeInstalled });
              }}
              tw={`${
                filter.includeInstalled
                  ? "text-[#000] font-bold"
                  : "font-medium "
              } inline-flex flex-row m-2 px-3 justify-center items-center rounded text-xs tracking-wide`}
            >
              {filter.includeInstalled ? (
                <CircleChecked tw="m-0 mr-1" size={16} color="black" />
              ) : (
                <CircleUnchecked tw="m-0 mr-1" size={16} color="#71717A" />
              )}
              {"Installed"}
            </Button>
          </View>
        </View>
      </View>
      <View tw="flex-1">
        <ScrollBar key={Math.random()}>
          {filteredList &&
            filteredList.map((app) => (
              <RenderApp key={app.publicKey.toString()} app={app} />
            ))}
        </ScrollBar>
      </View>
    </View>
  );
}

function SortButton({
  label,
  desc,
  active,
  onClick,
}: {
  label: string;
  desc: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      tw={`${
        active ? "text-[#000] font-bold" : "font-medium "
      } inline-flex flex-row m-2 px-3 justify-center items-center rounded text-xs tracking-wide`}
    >
      {label}
      {active &&
        (desc ? (
          <ArrowDownIcon tw="ml-1 mt-1" width={12} height={9} color="black" />
        ) : (
          <ArrowUpIcon tw="ml-1 mt-1" width={12} height={9} color="black" />
        ))}
    </Button>
  );
}

function RenderApp({ app }: { app: XnftWithMetadata }) {
  const nav = useNavigation();
  return (
    <View
      onClick={() => nav.push("details", { app })}
      tw="relative flex items-center gap-4 rounded-lg bg-[#27272A] m-4 p-4 shadow-lg transition-all hover:-translate-y-0.1 hover:bg-[#27272A]/40 cursor-pointer"
    >
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
        <View tw="py-1 flex justify-between">
          <Rating
            rating={app.account.totalRating.toNumber()}
            totalReviews={app.account.numRatings}
            starSize={12}
          />
          <View tw={`flex gap-1 text-white text-xs`}>
            {app.account.totalInstalls.toNumber()}
            {app.installed ? (
              <CircleChecked size={14} color={"white"} />
            ) : (
              <InstallIcon size={14} color={"white"} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default AppList;
