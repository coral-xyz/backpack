import { memo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowSmRightIcon } from "@heroicons/react/outline";

const Tabs = dynamic(() => import("./tabs"));
const UploadBundle = dynamic(() => import("./upload-bundle"));

function Publish() {
  const [selectedTab, setSelectedTab] = useState("Upload bundle");

  return (
    <div className="flex flex-col  items-center">
      <div className="flex max-w-xl flex-col gap-5">
        <h1 className="text-3xl font-bold leading-tight text-gray-50">
          Publish your app as an executable NFT
        </h1>

        <button
          type="button"
          className="mx-auto inline-flex w-32 cursor-no-drop items-center rounded-md border border-transparent bg-gray-700 px-4 py-2 font-medium tracking-wide text-gray-50 shadow-sm hover:bg-gray-500"
        >
          Learn more
        </button>

        <div className="mt-40 flex flex-col gap-2">
          <Tabs selected={selectedTab} setSelected={setSelectedTab} />
          {selectedTab === "Upload bundle" && <UploadBundle />}

          <button
            type="button"
            className="mx-auto mt-10 flex w-32 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium tracking-wide text-gray-50 shadow-sm hover:bg-indigo-700"
          >
            Next <ArrowSmRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(Publish);
