import express from "express";
const router = express.Router();
import notificationRouter from "./notifications";

router.use("/preferences", notificationRouter);

export default router;
