import request from "request";

import router from "./preferences";

router.get("/*", async (req, res) => {
  const url = (req.path || "")?.slice(1);
  try {
    const req = request("https://swr.xnfts.dev/1min/" + url.toString());
    req.on("error", function () {
      // Failures here are common due to spam NFTs (domain expiry, bad certs,
      // etc) so don't log anything to avoid cluttering the logs
      res.status(404).json({});
    });
    req.pipe(res);
  } catch (e) {
    res.status(500).json({ msg: "Error while proxying request" });
  }
});

export default router;
