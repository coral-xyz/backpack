import express from "express";
const router = express.Router();
import notificationRouter from "./notifications";

router.use("/notifications", notificationRouter);

export default router;
