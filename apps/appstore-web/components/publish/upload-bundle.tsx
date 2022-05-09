import { memo } from "react";
import { DocumentAddIcon } from "@heroicons/react/solid";

function UploadBundle({}) {
  return (
    <label className="flex h-64 min-w-max cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-gray-700 hover:bg-gray-700/80">
      <DocumentAddIcon className="h-20 text-gray-300" />
      <h3 className="text-gray-50">Upload a bundle.js file</h3>
      <input type="file" className="hidden" />
    </label>
  );
}

export default memo(UploadBundle);
