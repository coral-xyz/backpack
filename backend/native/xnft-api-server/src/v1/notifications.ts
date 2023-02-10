import express from "express";

import { xnftMiddleware } from "../auth/middleware";
import { sendNotifications } from "../controllers/notifications";
import { Errors } from "../errors";

const router = express.Router();

router.post("/", xnftMiddleware, async (req, res) => {
  const userIds: string[] = req.body.userIds;
  // @ts-ignore
  const xnftAddress = req.xnftAddress;
  const title = req.body.title;
  const body = req.body.body;

  if (!userIds || !title || !body) {
    res.status(411).json({ msg: Errors.INCORRECT_INPUT_ERROR });
    return;
  }

  await sendNotifications(xnftAddress, userIds, {
    body,
    title,
  })
    .then(() => res.status(200).json({ msg: "success" }))
    .catch((e) => {
      console.log(e);
      res.status(411).json({ msg: "Failed to send notification" });
    });
});

export default router;
