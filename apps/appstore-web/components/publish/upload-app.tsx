import { memo } from "react";
import { DocumentAddIcon, PhotographIcon } from "@heroicons/react/outline";

function UploadApp({ uploadState, uploadDispatch }: UploadAppProps) {
  return (
    <div className="flex cursor-pointer flex-col gap-8 rounded-xl bg-gray-700 px-14 py-10 hover:bg-gray-700/80">
      {/*  Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium tracking-wide text-gray-300"
        >
          Title
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="title"
            id="title"
            className="block w-full rounded-md border-gray-900 bg-gray-900 text-sm text-gray-300"
            value={uploadState.title}
            required
            onChange={(e) =>
              uploadDispatch({
                type: "field",
                field: "title",
                value: e.currentTarget.value,
              })
            }
          />
        </div>
      </div>

      {/*  Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm  font-medium tracking-wide text-gray-300"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            required
            id="description"
            name="description"
            rows={5}
            className="block w-full rounded-md border-gray-900 bg-gray-900 text-sm text-gray-300"
            value={uploadState.description}
            onChange={(e) =>
              uploadDispatch({
                type: "field",
                field: "description",
                value: e.currentTarget.value,
              })
            }
          />
        </div>
      </div>

      {/*  Publisher */}
      <div>
        <label
          htmlFor="website"
          className="block text-sm  font-medium tracking-wide text-gray-300"
        >
          Website
        </label>
        <div className="mt-1">
          <input
            type="url"
            name="website"
            id="website"
            className="block w-full rounded-md border-gray-900 bg-gray-900 text-sm text-gray-300"
            value={uploadState.publisher}
            onChange={(e) =>
              uploadDispatch({
                type: "field",
                field: "website",
                value: e.currentTarget.value,
              })
            }
          />
        </div>
      </div>

      {/*  Discord */}
      <div>
        <label
          htmlFor="discord"
          className="block text-sm  font-medium tracking-wide text-gray-300"
        >
          Discord
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="discord"
            id="discord"
            className="block w-full rounded-md border-gray-900 bg-gray-900 text-sm text-gray-300"
            value={uploadState.discord}
            onChange={(e) =>
              uploadDispatch({
                type: "field",
                field: "discord",
                value: e.currentTarget.value,
              })
            }
          />
        </div>
      </div>

      {/*  Twitter */}
      <div>
        <label
          htmlFor="twitter"
          className="block text-sm  font-medium tracking-wide text-gray-300"
        >
          Twitter
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="twitter"
            id="twitter"
            className="block w-full rounded-md border-gray-900 bg-gray-900 text-sm text-gray-300"
            value={uploadState.twitter}
            onChange={(e) =>
              uploadDispatch({
                type: "field",
                field: "twitter",
                value: e.currentTarget.value,
              })
            }
          />
        </div>
      </div>

      {/*  Bundle */}
      <div>
        <label
          htmlFor="bundle"
          className="block text-sm  font-medium tracking-wide text-gray-300"
        >
          Upload bundle
        </label>
        <label htmlFor="bundle" className="relative cursor-pointer">
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-500 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <DocumentAddIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="text-gray-300 hover:text-blue-500">
                  Upload a file
                </span>
                <input
                  required
                  id="bundle"
                  name="bundle"
                  accept=".js,.ts"
                  type="file"
                  className="sr-only hidden"
                  onChange={(e) =>
                    uploadDispatch({
                      type: "file",
                      field: "bundle",
                      value: e.target.files[0],
                    })
                  }
                />
              </div>
              <p className="text-xs text-gray-400">
                JavaScript bundle up to 1MB
              </p>
            </div>
          </div>
        </label>
      </div>

      {/*   App Icon */}
      <div>
        <label
          htmlFor="icon"
          className="block text-sm  font-medium tracking-wide text-gray-300"
        >
          App Icon
        </label>
        <label htmlFor="icon" className="relative cursor-pointer">
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-500 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="text-gray-300 hover:text-blue-500">
                  Upload an icon
                </span>
                <input
                  required
                  id="icon"
                  name="icon"
                  type="file"
                  accept="image/*"
                  className="sr-only hidden"
                  onChange={(e) =>
                    uploadDispatch({
                      type: "file",
                      field: "icon",
                      value: e.target.files[0],
                    })
                  }
                />
              </div>
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 1MB</p>
            </div>
          </div>
        </label>
      </div>

      {/*   App Screenshots */}
      <div>
        <label
          htmlFor="screenshots"
          className="block text-sm font-medium tracking-wide text-gray-300"
        >
          App Screenshots
        </label>
        <label htmlFor="screenshots" className="relative cursor-pointer">
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-500 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <PhotographIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="text-gray-300 hover:text-blue-500">
                  Upload the screenshots
                </span>
                <input
                  id="screenshots"
                  name="screenshots"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only hidden"
                  onChange={(e) =>
                    uploadDispatch({
                      type: "file",
                      field: "screenshots",
                      value: e.target.files,
                    })
                  }
                />
              </div>
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 1MB</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

interface UploadAppProps {
  uploadState: any;
  uploadDispatch: any;
}

export default memo(UploadApp);
