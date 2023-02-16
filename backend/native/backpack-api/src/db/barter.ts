import { Chain } from "@coral-xyz/chat-zeus";

import { CHAT_HASURA_URL, CHAT_JWT } from "../config";

const chain = Chain(CHAT_HASURA_URL, {
    headers: {
        Authorization: `Bearer ${CHAT_JWT}`,
    },
});

export const getOrCreateBarter = async ({roomId}: {roomId: string}) => {
    const response = await chain("query")({
        room_active_chat_mapping: [
            {
                where: {
                    room_id: { _eq: roomId },
                },
            },
            {

                parent_client_generated_uuid: true,
            },
        ],
    });
    return response.chats || [];
}