import { Chain } from "@coral-xyz/chat-zeus";
import type { BarterState } from "@coral-xyz/common";

import { CHAT_HASURA_URL, CHAT_JWT } from "../config";

const chain = Chain(CHAT_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${CHAT_JWT}`,
  },
});

export const getActiveBarter = async ({ roomId }: { roomId: string }) => {
  const response = await chain("query")({
    room_active_chat_mapping: [
      {
        where: {
          room_id: { _eq: roomId },
        },
      },
      {
        barter: {
          user1_offers: true,
          user2_offers: true,
          state: true,
          id: true,
        },
      },
    ],
  });
  return {
    id: response.room_active_chat_mapping[0]?.barter.id,
  };
};

export const getBarter = async ({
  barterId,
}: {
  barterId: string;
}): Promise<{
  user1_offers: string;
  user2_offers: string;
  state: string;
  id: number;
  room_id: string;
} | null> => {
  const response = await chain("query")({
    barters_by_pk: [
      {
        id: parseInt(barterId),
      },
      {
        user1_offers: true,
        user2_offers: true,
        state: true,
        id: true,
        room_id: true,
      },
    ],
  });

  const barterResponse = response.barters_by_pk;

  if (!barterResponse) {
    return null;
  }

  return {
    user1_offers: barterResponse?.user1_offers,
    user2_offers: barterResponse?.user2_offers,
    state: barterResponse?.state,
    id: barterResponse?.id || 0,
    room_id: barterResponse.room_id || "",
  };
};

export const getOrCreateBarter = async ({
  roomId,
}: {
  roomId: string;
}): Promise<{
  barter: {
    user1_offers: string;
    user2_offers: string;
    state: BarterState;
    id: number;
  };
}> => {
  const response = await chain("query")({
    room_active_chat_mapping: [
      {
        where: {
          room_id: { _eq: roomId },
        },
      },
      {
        barter: {
          user1_offers: true,
          user2_offers: true,
          state: true,
          id: true,
          room_id: true,
        },
      },
    ],
  });
  if (!response.room_active_chat_mapping[0]) {
    console.error("roomid is " + roomId);
    const { id } = await createBarter({ roomId });
    return {
      barter: {
        id,
        user1_offers: "[]",
        user2_offers: "[]",
        state: "in_progress",
      },
    };
  }
  return response.room_active_chat_mapping[0];
};

export const createBarter = async ({
  roomId,
}: {
  roomId: string;
}): Promise<{ id: number }> => {
  const response = await chain("mutation")({
    insert_room_active_chat_mapping_one: [
      {
        object: {
          barter: {
            data: {
              user1_offers: "[]",
              user2_offers: "[]",
              room_id: roomId,
            },
          },
          room_id: roomId,
        },
      },
      { barter: { id: true } },
    ],
  });
  return {
    id: response.insert_room_active_chat_mapping_one.barter.id,
  };
};

export const updateActiveBarter = async ({
  roomId,
  userId,
  offers,
  userIndex,
}: {
  roomId: string;
  userId: string;
  offers: string;
  userIndex: "2" | "1";
}): Promise<{ id: number }> => {
  const response = await chain("mutation")({
    update_barters: [
      {
        where: {
          room_active_chat_mappings: {
            room_id: { _eq: roomId.toString() },
          },
        },
        _set: {
          [`user${userIndex}_offers`]: offers,
        },
      },
      {
        affected_rows: true,
        returning: {
          id: true,
        },
      },
    ],
  });

  return {
    id: response.update_barters?.returning[0]?.id || 0,
  };
};

export const executeActiveBarter = async ({ roomId }: { roomId: string }) => {
  await chain("mutation")({
    update_barters: [
      {
        where: {
          room_active_chat_mappings: {
            room_id: { _eq: roomId.toString() },
          },
        },
        _set: {
          state: "on_chain",
        },
      },
      {
        affected_rows: true,
      },
    ],
    delete_room_active_chat_mapping: [
      {
        where: {
          room_id: { _eq: roomId },
        },
      },
      {
        affected_rows: true,
      },
    ],
  });
};
