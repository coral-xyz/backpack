import express from "express";
const router = express.Router();
import notificationRouter from "./notifications";
import userRoutes from "./users";
import xnftRoutes from "./xnft";

router.use("/notifications", notificationRouter);
router.use("/users", userRoutes);
router.use("/xnft", xnftRoutes);

export default router;
