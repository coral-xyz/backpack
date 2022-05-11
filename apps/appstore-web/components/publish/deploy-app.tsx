import { memo } from "react";
import { DocumentAddIcon } from "@heroicons/react/solid";

function DeployApp({ setFile }: DeployAppProps) {
  return (
    <label className="flex cursor-pointer flex-col gap-6 gap-1 rounded-xl bg-gray-700 px-14 py-10 hover:bg-gray-700/80">
      {/*  Title */}
      <div>
        <label
          htmlFor="title"
          className="block font-medium tracking-wide text-gray-300"
        >
          Title
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="title"
            id="title"
            className="block w-full rounded-md border-gray-900 bg-gray-900 text-sm text-gray-300"
          />
        </div>
      </div>

      {/*  Description */}
      <div>
        <label
          htmlFor="description"
          className="block font-medium tracking-wide text-gray-300"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={5}
            className="block w-full rounded-md border-gray-900 bg-gray-900 text-sm text-gray-300"
            defaultValue={""}
          />
        </div>
      </div>

      <DocumentAddIcon className="h-20 text-gray-300" />
      <h3 className="text-gray-50">Upload a bundle.js file</h3>
      <input
        type="file"
        className="hidden"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </label>
  );
}

interface DeployAppProps {
  setFile: any;
}

export default memo(DeployApp);
