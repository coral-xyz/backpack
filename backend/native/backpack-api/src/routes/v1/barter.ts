import express from "express";
import {ensureHasRoomAccess, extractUserId} from "../../auth/middleware";
import {getOrCreateFriendship} from "../../db/friendships";

const router = express.Router();

router.get("/activeBarter", ensureHasRoomAccess, async (req, res) => {
    // @ts-ignore
    const room: string = req.query.room;
    const barter = await getOrCreateBarter({ room });

    res.json({
        id: barter.id,

    });
});
