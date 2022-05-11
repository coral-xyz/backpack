import { memo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowSmRightIcon } from "@heroicons/react/outline";
import fetch from "isomorphic-unfetch";

const Tabs = dynamic(() => import("./tabs"));
const DeployApp = dynamic(() => import("./deploy-app"));

const BUCKET_URL = "https://xnfts.s3.us-west-2.amazonaws.com/";

function Publish() {
  const [selectedTab, setSelectedTab] = useState("Deploy App");
  const [file, setFile] = useState<any>();
  const [uploadedFile, setUploadedFile] = useState("");

  async function uploadBundle() {
    const resp = await fetch("/api/s3", {
      method: "POST",
      body: JSON.stringify({
        name: file.name,
        type: file.type,
      }),
    });

    let data = await resp.json();

    const url = data.url;

    const resp2 = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-type": file.type,
        "Access-Control-Allow-Origin": "*",
      },
      body: file,
    });

    const data2 = await resp2.json();

    setUploadedFile(BUCKET_URL + data2.name);
    setFile(null);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-3xl font-bold leading-tight text-gray-50">
          Publish your app as an executable NFT
        </h1>

        <button
          type="button"
          className="mx-auto inline-flex w-32 cursor-no-drop items-center rounded-md border border-transparent bg-gray-700 px-4 py-2 font-medium tracking-wide text-gray-50 shadow-sm hover:bg-gray-500"
        >
          Learn more
        </button>

        {/* Tabs */}
        <div className="mt-20 flex flex-col gap-2">
          <Tabs selected={selectedTab} setSelected={setSelectedTab} />
          {selectedTab === "Deploy App" && <DeployApp setFile={setFile} />}

          <button
            type="button"
            className="mx-auto mt-10 flex w-32 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium tracking-wide text-gray-50 shadow-sm hover:bg-indigo-700"
            onClick={() => uploadBundle()}
          >
            Next <ArrowSmRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(Publish);
