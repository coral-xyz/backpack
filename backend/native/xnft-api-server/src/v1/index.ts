import express from "express";
const router = express.Router();
import notificationRouter from "./notifications";
import userRoutes from "./users";

router.use("/notifications", notificationRouter);
router.use("/users", userRoutes);

export default router;
