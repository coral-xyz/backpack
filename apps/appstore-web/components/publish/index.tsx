import { memo, useReducer, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowSmRightIcon } from "@heroicons/react/outline";
import useAuth from "../../hooks/useAuth";
import { uploadToS3 } from "../../utils/s3";

const Tabs = dynamic(() => import("./tabs"));
const UploadApp = dynamic(() => import("./upload-app"));

const BUCKET_URL = "https://xnfts.s3.us-west-2.amazonaws.com/";

function uploadReducer(state, action) {
  switch (action.type) {
    case "field": {
      return {
        ...state,
        [action.field]: action.value,
      };
    }
    case "file": {
      return {
        ...state,
        [action.field]: action.value,
      };
    }
  }
}

const uploadInitialState = {
  title: "",
  description: "",
  publisher: "",
  discord: "",
  twitter: "",
  bundle: {},
  icon: {},
  screenshots: {},
};

function Publish() {
  const { session, status } = useAuth(true);
  const [selectedTab, setSelectedTab] = useState("Upload App");
  const [uploadState, uploadDispatch] = useReducer(
    uploadReducer,
    uploadInitialState
  );
  const [file, setFile] = useState<any>();
  const [uploadedFiles, setUploadedFiles] = useState("");

  async function uploadBundle() {
    //
    // let folderName = `${session.user.name}/${uploadState.title}`;
    // let count = 0;
    //
    // for await (const file of files) {
    //   console.log("File", file);
    //   if (count === 0) {
    //     folderName = `${folderName}/bundle`;
    //     count++;
    //   } else if (count === 1) {
    //     folderName = `${folderName}/icon`;
    //     count++;
    //   } else {
    //     folderName = `${folderName}/screenshots`;
    //     count++;
    //   }

    // let { url } = await uploadToS3(uploadState.bundle);
    // console.log("url", url);
    // const content = {
    //   title: uploadState.title,
    //   publicKey: session.user.name,
    // };
    //
    // let formData = new FormData();
    //
    // formData.append("data", JSON.stringify(content));
    // formData.append("bundle", uploadState.bundle);
    // formData.append("icon", uploadState.icon);
    //
    // await fetch("/api/s3", {
    //   method: "POST",
    //   body: formData,
    // });
    await uploadToS3(uploadState.bundle);
    // try {
    //
    // } catch (err) {
    //   console.error("Error saving file in S3", err);
    // }
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
        <div className="mt-10 flex flex-col gap-2">
          <Tabs selected={selectedTab} setSelected={setSelectedTab} />
          <form
            action="#"
            method="POST"
            onSubmit={selectedTab === "Upload App" ? uploadBundle : () => {}}
          >
            {selectedTab === "Upload App" && (
              <UploadApp
                uploadState={uploadState}
                uploadDispatch={uploadDispatch}
              />
            )}

            <button
              type="submit"
              className="mx-auto mt-10 flex w-32 justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium tracking-wide text-gray-50 shadow-sm hover:bg-indigo-700"
              disabled={status !== "authenticated"}
            >
              Next <ArrowSmRightIcon className="h-6 w-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default memo(Publish);
