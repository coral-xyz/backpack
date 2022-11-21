import router from "./preferences";
import request from "request";

router.get("/*", async (req, res) => {
  const url = req.path.slice(1);
  try {
    request(url).pipe(res);
  } catch (e) {
    res.status(500).json({ msg: "Error while proxying request" });
  }
});

export default router;
