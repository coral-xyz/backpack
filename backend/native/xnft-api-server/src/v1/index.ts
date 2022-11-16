import express from "express";
const router = express.Router();
import notificationRouter from "./notifications";

router.use("/backpack-api", notificationRouter);

export default router;
