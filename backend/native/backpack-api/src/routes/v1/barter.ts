import express from "express";
import {ensureHasRoomAccess, extractUserId} from "../../auth/middleware";
import {executeActiveBarter, getOrCreateBarter, updateActiveBarter} from "../../db/barter";
import {sendMessage} from "../../messaging/messaging";
import {getFriendshipById} from "../../db/friendships";

const router = express.Router();

router.get("/activeBarter", extractUserId, ensureHasRoomAccess, async (req, res) => {
    // @ts-ignore
    const room: string = req.query.room;
    const barter = await getOrCreateBarter({ roomId: room });
    try {
        const parsedBarter = {
            ...barter,
            user1_offers: JSON.parse(barter.barter.user1_offers),
            user2_offers: JSON.parse(barter.barter.user2_offers),
            state: barter.barter.state,
        }
        res.json({
            barter: parsedBarter,
        });
    } catch(e) {
        console.error(e);
    }
});

router.post("/barter", extractUserId, ensureHasRoomAccess, async(req, res) => {
    // @ts-ignore
    const room: string = req.query.room;
    const updatedOffer = req.body.updatedOffer;
    const uuid: string = req.query.uuid;

    const { user1, user2 } = await getFriendshipById({roomId: parseInt(roomId)});
    const userIndex = uuid === user1 ? "1" : "2";

    // TODO: add validation atleast to updatedOffer.
    const barter = await updateActiveBarter({ roomId: room, userId: uuid, offers: JSON.stringify(updatedOffer), userIndex});

    res.json({
        barter
    });
});

router.post("/execute", extractUserId, ensureHasRoomAccess, async(req, res) => {
    // @ts-ignore
    const room: string = req.query.room;
    // @ts-ignore
    const userId = req.id;
    // TODO: send contract txn here, maybe check that the DB state looks the same as the contract state before sending.
    const client_generated_uuid = req.query.client_generated_uuid;

    await executeActiveBarter({ roomId: room });
    await sendMessage({roomId: room, msg: {
            client_generated_uuid: client_generated_uuid,
            message: `Barter`,
            message_kind: "barter",
            message_metadata: {
                contract_address: "",
            }
    }, type: "individual", userId});

    res.json({});
});


