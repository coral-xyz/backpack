import { toast as toastLibrary } from "react-toastify";

import { Success } from "./Success";

export const toast = {
  success: (title, body) => {
    toastLibrary(<Success title={title} body={body} />, {
      position: "top-center",
      hideProgressBar: true,
    });
  },
};
