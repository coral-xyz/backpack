import express from "express";
import { getUsers } from "../../db/users";

const router = express.Router();

router.post("/", async (req, res) => {
  const userIds = req.body.userIds;
  try {
    const users = await getUsers(userIds);
    res.json({ users });
  } catch (e) {
    res.status(500).json({ msg: "Error while Fetching response" });
  }
});

export default router;
