import { Chain } from "@coral-xyz/zeus";
import { HASURA_URL, JWT } from "../config";
import { InboxDb } from "@coral-xyz/common";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getOrCreateFriendship = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const { user1, user2 } = getSortedUsers(from, to);

  const existingFriendship = await chain("query")({
    auth_friendships: [
      {
        where: { user1: { _eq: user1 }, user2: { _eq: user2 } },
        limit: 1,
      },
      {
        id: true,
      },
    ],
  });

  if (existingFriendship.auth_friendships[0]?.id) {
    return existingFriendship.auth_friendships[0]?.id;
  } else {
    const response = await chain("mutation")({
      insert_auth_friendships_one: [
        {
          object: {
            user1,
            user2,
            are_friends: false,
          },
          on_conflict: {
            //@ts-ignore
            update_columns: ["are_friends"],
            //@ts-ignore
            constraint: "friendships_pkey",
          },
        },
        { id: true },
      ],
    });
    return response.insert_auth_friendships_one?.id;
  }
};

export const getFriendships = async ({
  uuid,
  limit,
  offset,
  are_friends,
}: {
  uuid: string;
  limit: number;
  offset: number;
  are_friends: boolean;
}): Promise<InboxDb[]> => {
  const response = await chain("query")({
    auth_friendships: [
      {
        limit,
        offset,
        //@ts-ignore
        order_by: [{ last_message_timestamp: "desc" }],
        where: {
          _or: [
            {
              user1: { _eq: uuid },
              are_friends: { _eq: are_friends },
            },
            {
              user2: { _eq: uuid },
              are_friends: { _eq: are_friends },
            },
          ],
        },
      },
      {
        id: true,
        are_friends: true,
        user1: true,
        user2: true,
        last_message_timestamp: true,
        last_message: true,
        last_message_sender: true,
      },
    ],
  });

  return response.auth_friendships ?? [];
};

export async function setFriendship({
  from,
  to,
  sendRequest,
}: {
  from: string;
  to: string;
  sendRequest: boolean;
}) {
  if (!sendRequest) {
    return deleteFriendRequest({ from, to });
  }

  const { user1, user2 } = getSortedUsers(from, to);

  const existingFriendship = await chain("query")({
    auth_friendships: [
      {
        where: { user1: { _eq: user1 }, user2: { _eq: user2 } },
        limit: 1,
      },
      {
        are_friends: true,
      },
    ],
  });

  if (existingFriendship.auth_friendships[0]?.are_friends) {
    console.log(`users ${user1} and ${user2} are already friends`);
    return;
  }

  const otherUserFriendshipRequest = await chain("query")({
    auth_friend_requests: [
      {
        where: { from: { _eq: to }, to: { _eq: from } },
        limit: 1,
      },
      {
        id: true,
      },
    ],
  });
  if (otherUserFriendshipRequest.auth_friend_requests[0]) {
    // Other user also requested to friend this user
    // TODO: send these together?
    await chain("mutation")({
      delete_auth_friend_requests: [
        {
          where: { from: { _eq: from }, to: { _eq: to } },
        },
        {
          affected_rows: true,
        },
      ],
    });
    await chain("mutation")({
      delete_auth_friend_requests: [
        {
          where: { from: { _eq: to }, to: { _eq: from } },
        },
        {
          affected_rows: true,
        },
      ],
    });
    console.log("above main mutation");
    // @ts-ignore
    await chain("mutation")({
      insert_auth_friendships_one: [
        {
          object: {
            user1,
            user2,
            are_friends: true,
          },
          on_conflict: {
            //@ts-ignore
            update_columns: ["are_friends"],
            //@ts-ignore
            constraint: "friendships_pkey",
          },
        },
        { id: true },
      ],
    });
  } else {
    console.log("elseee");
    await chain("mutation")({
      insert_auth_friend_requests_one: [
        {
          object: {
            from,
            to,
          },
        },
        { id: true },
      ],
    });
  }
}

async function deleteFriendRequest({ from, to }: { from: string; to: string }) {
  await chain("mutation")({
    delete_auth_friend_requests: [
      {
        where: { from: { _eq: from }, to: { _eq: to } },
      },
      { affected_rows: true },
    ],
  });
}

function getSortedUsers(from: string, to: string) {
  let user1 = "";
  let user2 = "";
  if (from < to) {
    user1 = from;
    user2 = to;
  } else {
    user2 = from;
    user1 = to;
  }
  return { user1, user2 };
}

export const getFriendship = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<{ are_friends: boolean; request_sent: boolean }> => {
  const { user1, user2 } = getSortedUsers(from, to);
  const existingFriendship = await chain("query")({
    auth_friendships: [
      {
        where: { user1: { _eq: user1 }, user2: { _eq: user2 } },
        limit: 1,
      },
      {
        are_friends: true,
      },
    ],
    auth_friend_requests: [
      {
        where: { from: { _eq: from }, to: { _eq: to } },
      },
      { id: true },
    ],
  });

  return {
    are_friends: existingFriendship.auth_friendships[0]?.are_friends ?? false,
    request_sent: existingFriendship.auth_friend_requests[0] ? true : false,
  };
};

export const validateRoom = async (uuid: string, roomId: number) => {
  const response = await chain("query")({
    auth_friendships: [
      {
        where: {
          _or: [
            {
              id: { _eq: roomId },
              user1: { _eq: uuid },
            },
            {
              id: { _eq: roomId },
              user2: { _eq: uuid },
            },
          ],
        },
      },
      {
        id: true,
      },
    ],
  });

  if (response.auth_friendships) {
    return true;
  }

  return false;
};
