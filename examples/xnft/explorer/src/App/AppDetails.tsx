import React, { useState } from "react";
import {
  Button,
  Image,
  ScrollBar,
  Text,
  TextField,
  useNavigation,
  View,
} from "react-xnft";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  useRecoilState,
  useRecoilStateLoadable,
  useRecoilValueLoadable,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";

import installedAppAtom from "./_atoms/installedAppAtom";
import reviewsAtom from "./_atoms/reviewsAtom";
import xnftsAtom from "./_atoms/xnftsAtom";
import type { XnftWithMetadata } from "./_types/XnftWithMetadata";
import getAllxNFTs from "./_utils/getAllXnfts";
import getGatewayUri from "./_utils/getGatewayUri";
import getProgram from "./_utils/getProgram";
import { IDL } from "./_utils/xnftIDL";
import InstallIcon from "./Icons/InstallIcon";
import CenteredLoader from "./CenteredLoader";
import Rating from "./Rating";

const tabs = [
  { name: "Screenshots" },
  { name: "Information" },
  { name: "Reviews" },
];
const XNFT_KIND_OPTIONS = IDL.types[3].type.variants.map((v) => v.name);
const XNFT_L1_OPTIONS = IDL.types[4].type.variants.map((v) => v.name);
const XNFT_TAG_OPTIONS = IDL.types[5].type.variants.map((v) => v.name);

function AppDetails({ app }: { app: XnftWithMetadata }) {
  const [installedAppsLoadable, setInstalledApps] =
    useRecoilStateLoadable(installedAppAtom);
  const nav = useNavigation();
  const [selectedTab, setSelectedTab] = useState(tabs[0].name);
  const reviews = useRecoilValueLoadable(reviewsAtom(app.publicKey.toString()));
  const price = app.account.installPrice.toNumber();
  const noReviews =
    reviews.state === "hasValue" && reviews.contents.length === 0;
  //  @ts-ignore-next-line
  const collectionDetails = app.metadata.collectionDetails;
  //  @ts-ignore-next-line
  const metadataDataUri = app.metadata.data.uri;
  const installedApps =
    installedAppsLoadable.state === "hasValue"
      ? installedAppsLoadable.contents
      : [];
  const installed = installedApps.includes(app.publicKey.toString());
  const install = async () => {
    const program = getProgram(
      window.xnft.solana.connection,
      window.xnft.solana
    );
    const tx = await program.methods
      .createInstall()
      .accounts({
        xnft: new PublicKey(app.publicKey),
        installVault: new PublicKey(app.account.installVault),
      })
      .transaction();
    await window.xnft.solana.sendAndConfirm(tx);
    setInstalledApps([...installedApps, app.publicKey.toString()]);
  };
  const open = async () => {
    window.xnft.openPlugin(app.publicKey);
  };
  return (
    <View tw="pb-2">
      <View tw="flex gap-6 py-2 px-4">
        <Image
          tw="col-Text-1 rounded-lg h-[120px] w-[120px]"
          src={getGatewayUri(app.json.image)}
        />
        <View tw="flex flex-col items-start gap-4">
          <Rating
            rating={app.account.totalRating.toNumber()}
            totalReviews={app.account.numRatings}
            starSize={16}
          />
          <View tw="flex items-center gap-4">
            {app.account.suspended && (
              <Text tw="badge rounded-xl bg-red-400/25 py-1 px-2 text-xs text-red-400">
                suspended
              </Text>
            )}
            <Text tw="flex items-center gap-1.5 rounded-2xl bg-[#4F46E5] px-3 py-1 text-xs font-small tracking-wide text-white">
              <InstallIcon size={16} color={"#fff"} />{" "}
              {app.account.totalInstalls.toNumber()}
            </Text>
          </View>
          {!app.account.suspended && (
            <View tw="flex items-center gap-4">
              {!installed ? (
                <>
                  <Button
                    onClick={() => install()}
                    tw="flex items-center gap-2.5 bg-white py-2 text-[#374151] px-3 rounded text-xs font-medium tracking-wide"
                  >
                    {price === 0 ? "Free" : `${price / LAMPORTS_PER_SOL} SOL`}
                    <InstallIcon size={16} color={"#374151"} />
                  </Button>
                  <Button
                    onClick={open}
                    tw="rounded bg-[#27272A] text-white px-3 rounded text-xs font-medium tracking-wide"
                  >
                    Preview
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={open}
                    tw="rounded bg-[#27272A] text-white px-3 rounded text-xs font-medium tracking-wide"
                  >
                    Open
                  </Button>
                  <Button
                    onClick={() => {
                      nav.push("review", { app });
                    }}
                    tw="flex items-center gap-2.5 bg-white py-2 text-[#374151] px-3 rounded text-xs font-medium tracking-wide"
                  >
                    {"Add Review"}
                  </Button>
                </>
              )}
            </View>
          )}
        </View>
      </View>
      <View tw="px-4 py-2 max-w-md text-lg font-medium text-[#99A4B4]">
        {app.json.description}
      </View>
      <View tw="mb-2 border-b-2 border-[#393C43]">
        <View tw="mx-auto -mb-px flex justify-center space-x-12">
          {tabs.map((tab) => (
            <View
              key={tab.name}
              tw={`${
                selectedTab === tab.name
                  ? "border-[#FC9870] text-[#FC9870]"
                  : "border-transparent text-[#99A4B4]"
              }
                cursor-pointer whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              `}
              onClick={() => setSelectedTab(tab.name)}
            >
              {tab.name}
            </View>
          ))}
        </View>
      </View>
      {selectedTab === "Screenshots" && (
        <View tw="flex flex-row flex-wrap items-center gap-6 px-4 py-2 max-w-md text-lg font-medium text-[#99A4B4] ">
          {app.json.properties.files.map((file) => {
            return (
              <Image
                key={file.uri}
                tw="rounded-lg w-[158px]"
                style={{
                  boxShadow: "0 0 4px rgba(255, 255, 255, 0.2)",
                }}
                src={getGatewayUri(file.uri)}
              />
            );
          })}
        </View>
      )}
      {!noReviews && selectedTab === "Reviews" && (
        <>
          <View tw="pb-0 max-w-md text-lg font-medium text-[#99A4B4]">
            {reviews.state === "loading" && <CenteredLoader />}
            {reviews.state === "hasValue" &&
              reviews.contents.map((review) => {
                return (
                  <View tw="rounded-lg bg-[#27272A] m-4 p-4 shadow-lg">
                    <View tw="truncate text-xs tracking-wide text-[#FAFAFA]/75">
                      {review.author}
                    </View>
                    <View tw="py-1">
                      <Rating rating={review.rating} starSize={12} />
                    </View>
                    <View tw="font-bold tracking-wide text-white">
                      {review.comment}
                    </View>
                  </View>
                );
              })}
          </View>
        </>
      )}
      {noReviews && selectedTab === "Reviews" && (
        <>
          <View tw="pb-0 max-w-md text-lg font-medium text-[#99A4B4]">
            <View tw="rounded-lg bg-[#27272A] m-4 p-4 shadow-lg">
              {/* <View tw="truncate text-xs tracking-wide text-[#FAFAFA]/75">
              {review.author}
            </View>
            <View tw="py-1">
              <Rating rating={review.rating} starSize={12} />
            </View> */}
              <View tw="font-bold tracking-wide text-white">
                No reviews available.
              </View>
            </View>
          </View>
        </>
      )}
      {selectedTab === "Information" && (
        <View tw="m-4 p-4 mb-2 flex break-words max-w-3xl flex-col gap-4 rounded-2xl bg-[#27272A]">
          <Item name="Authority" value={app.token.owner.toString()} />
          <Item name="Publisher" value={app.account.publisher.toString()} />
          <Item
            name="L1"
            value={enumVariantName(XNFT_L1_OPTIONS, app.account.l1)}
          />
          <Item
            name="Kind"
            value={enumVariantName(XNFT_KIND_OPTIONS, app.account.kind)}
          />
          <Item
            name="Tag"
            value={enumVariantName(XNFT_TAG_OPTIONS, app.account.tag)}
          />
          {app.json.external_url && (
            <Item name="Website" value={app.json.external_url} />
          )}
          <Item
            name="Supply"
            value={
              collectionDetails ? (
                parseInt(collectionDetails.size.toString(), 16).toLocaleString()
              ) : (
                <>&#8734;</>
              )
            }
          />
          <Item
            name="Last Updated"
            value={new Date(
              app.account.updatedTs.toNumber() * 1000
            ).toUTCString()}
          />
          {metadataDataUri && <Item name="Metadata" value={metadataDataUri} />}
        </View>
      )}
    </View>
  );
}

function enumVariantName(
  options: string[],
  v: Partial<{ [K: string]: {} }>
): string {
  const lowercaseKey = Object.keys(v)[0].toLowerCase();
  return options.find((o) => o.toLowerCase() === lowercaseKey) ?? "";
}

function Item({ name, value }: { name: string; value: string | JSX.Element }) {
  return (
    <View tw="flex flex-col gap-1">
      <Text tw="text-sm text-[#99A4B4]">{name}</Text>
      <Text tw="font-medium text-white">{value}</Text>
    </View>
  );
}

export default AppDetails;
