import type { InboxDb } from "@coral-xyz/common";
import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getFriendshipById = async ({
  roomId,
}: {
  roomId: number;
}): Promise<null | { user1: string; user2: string }> => {
  const friendship = await chain("query")({
    auth_friendships: [
      {
        where: { id: { _eq: roomId } },
        limit: 1,
      },
      {
        user1: true,
        user2: true,
      },
    ],
  });

  return friendship.auth_friendships[0] || null;
};

export const getOrCreateFriendship = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const { user1, user2 } = getSortedUsers(from, to);
  const spamLabel = getLabel("spam", from, to);
  const blockedLabel = getLabel("blocked", from, to);

  const existingFriendship = await chain("query")({
    auth_friendships: [
      {
        where: { user1: { _eq: user1 }, user2: { _eq: user2 } },
        limit: 1,
      },
      {
        id: true,
        are_friends: true,
        [spamLabel]: true,
        [blockedLabel]: true,
      },
    ],
    auth_friend_requests: [
      {
        where: {
          _or: [
            { from: { _eq: from }, to: { _eq: to } },
            { from: { _eq: to }, to: { _eq: from } },
          ],
        },
        limit: 1,
      },
      { id: true, from: true, to: true },
    ],
  });

  const requested = existingFriendship.auth_friend_requests.find(
    (x) => x.from === from
  )
    ? true
    : false;
  const remote_requested = existingFriendship.auth_friend_requests.find(
    (x) => x.from === to
  )
    ? true
    : false;

  if (existingFriendship.auth_friendships[0]?.id) {
    return {
      id: existingFriendship.auth_friendships[0]?.id,
      are_friends: existingFriendship.auth_friendships[0]?.are_friends,
      requested,
      remote_requested,
      spam: existingFriendship.auth_friendships[0]?.[spamLabel] ? true : false,
      blocked: existingFriendship.auth_friendships[0]?.[blockedLabel]
        ? true
        : false,
    };
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
    return {
      id: response.insert_auth_friendships_one?.id,
      are_friends: false,
      requested,
      remote_requested,
      spam: false,
      blocked: false,
    };
  }
};

export const getAllFriendships = async ({
  uuid,
  limit,
  offset,
}: {
  uuid: string;
  limit: number;
  offset: number;
}) => {
  const response = await chain("query")({
    auth_friendships: [
      {
        where: {
          _or: [
            {
              user1: { _eq: uuid },
              // Only show users if either users have interacted with each other or they are friends
              _or: [
                {
                  user1_interacted: { _eq: true },
                },
                {
                  user2_interacted: { _eq: true },
                },
                {
                  are_friends: { _eq: true },
                },
              ],
            },
            {
              user2: { _eq: uuid },
              // Only show users if either users have interacted with each other or they are friends
              _or: [
                {
                  user1_interacted: { _eq: true },
                },
                {
                  user2_interacted: { _eq: true },
                },
                {
                  are_friends: { _eq: true },
                },
              ],
            },
          ],
        },
        // limit,
        // offset,
        //@ts-ignore
        order_by: [{ last_message_timestamp: "desc" }],
      },
      {
        id: true,
        are_friends: true,
        user1: true,
        user2: true,
        last_message_timestamp: true,
        last_message: true,
        last_message_sender: true,
        last_message_client_uuid: true,
        user1_last_read_message_id: true,
        user2_last_read_message_id: true,
        user1_blocked_user2: true,
        user2_blocked_user1: true,
        user1_spam_user2: true,
        user2_spam_user1: true,
        user1_interacted: true,
        user2_interacted: true,
      },
    ],
    auth_friend_requests: [
      {
        where: {
          _or: [{ from: { _eq: uuid } }, { to: { _eq: uuid } }],
        },
      },
      {
        id: true,
        from: true,
        to: true,
      },
    ],
  });
  return {
    friendships: response.auth_friendships,
    friendRequests: response.auth_friend_requests,
  };
};

export const getReceivedRequests = async ({
  uuid,
}: {
  uuid: string;
}): Promise<string[]> => {
  const response = await chain("query")({
    auth_friend_requests: [
      {
        where: {
          to: { _eq: uuid },
        },
      },
      {
        from: true,
      },
    ],
    auth_friendships: [
      {
        where: {
          _or: [
            {
              user1: { _eq: uuid },
              _or: [
                { are_friends: { _eq: true } },
                { user1_blocked_user2: { _eq: true } },
              ],
            },
            {
              user2: { _eq: uuid },
              _or: [
                { are_friends: { _eq: true } },
                { user2_blocked_user1: { _eq: true } },
              ],
            },
          ],
        },
      },
      {
        user1: true,
        user2: true,
      },
    ],
  });

  const blockedOrFriends: { [userId: string]: boolean } = {};
  response.auth_friendships.forEach((x) => {
    blockedOrFriends[x.user1 || ""] = true;
    blockedOrFriends[x.user2 || ""] = true;
  });
  return response.auth_friend_requests
    .map((x) => x.from)
    .filter((userId) => !blockedOrFriends[userId]);
};

export const getSentRequests = async ({
  uuid,
}: {
  uuid: string;
}): Promise<string[]> => {
  const response = await chain("query")({
    auth_friend_requests: [
      {
        where: {
          from: { _eq: uuid },
        },
      },
      {
        to: true,
      },
    ],
    auth_friendships: [
      {
        where: {
          _or: [
            {
              user1: { _eq: uuid },
              _or: [
                { are_friends: { _eq: true } },
                { user1_blocked_user2: { _eq: true } },
              ],
            },
            {
              user2: { _eq: uuid },
              _or: [
                { are_friends: { _eq: true } },
                { user2_blocked_user1: { _eq: true } },
              ],
            },
          ],
        },
      },
      {
        user1: true,
        user2: true,
      },
    ],
  });
  const blockedOrFriends: { [userId: string]: boolean } = {};
  response.auth_friendships.forEach((x) => {
    blockedOrFriends[x.user1 || ""] = true;
    blockedOrFriends[x.user2 || ""] = true;
  });
  return response.auth_friend_requests
    .map((r) => r.to)
    .filter((userId) => !blockedOrFriends[userId]);
};

export const getFriendships = async ({
  uuid,
  limit,
  offset,
  areConnected,
}: {
  uuid: string;
  limit: number;
  offset: number;
  areConnected: boolean;
}): Promise<{ requestCount: number; friendships: InboxDb[] }> => {
  let where = {};
  if (areConnected) {
    where = {
      _or: [
        {
          user1: { _eq: uuid },
          _or: [
            { are_friends: { _eq: true } },
            { user1_interacted: { _eq: true } },
          ],
          user1_blocked_user2: { _eq: false },
        },
        {
          user2: { _eq: uuid },
          _or: [
            { are_friends: { _eq: true } },
            { user2_interacted: { _eq: true } },
          ],
          user2_blocked_user1: { _eq: false },
        },
      ],
    };
  } else {
    where = {
      _or: [
        {
          user1: { _eq: uuid },
          are_friends: { _eq: false },
          user1_interacted: { _eq: false },
          user1_blocked_user2: { _eq: false },
          user2_interacted: { _eq: true },
        },
        {
          user2: { _eq: uuid },
          are_friends: { _eq: false },
          user2_interacted: { _eq: false },
          user2_blocked_user1: { _eq: false },
          user1_interacted: { _eq: true },
        },
      ],
    };
  }
  const response = await chain("query")({
    auth_friendships: [
      {
        limit,
        offset,
        //@ts-ignore
        order_by: [{ last_message_timestamp: "desc" }],
        where,
      },
      {
        id: true,
        are_friends: true,
        user1: true,
        user2: true,
        last_message_timestamp: true,
        last_message: true,
        last_message_sender: true,
        last_message_client_uuid: true,
        user1_last_read_message_id: true,
        user2_last_read_message_id: true,
      },
    ],
    auth_friendships_aggregate: [
      {
        where: {
          _or: [
            {
              user1: { _eq: uuid },
              are_friends: { _eq: false },
              user1_interacted: { _eq: false },
              user1_blocked_user2: { _eq: false },
              user2_interacted: { _eq: true },
            },
            {
              user2: { _eq: uuid },
              are_friends: { _eq: false },
              user2_interacted: { _eq: false },
              user2_blocked_user1: { _eq: false },
              user1_interacted: { _eq: true },
            },
          ],
        },
      },
      {
        aggregate: {
          count: true,
        },
      },
    ],
  });

  return {
    friendships: response.auth_friendships ?? [],
    requestCount: response.auth_friendships_aggregate.aggregate?.count || 0,
  };
};

export const getFriendshipStatus = async (
  userIds: string[],
  myuserId: string
): Promise<
  {
    id: string;
    areFriends: boolean;
    requested: boolean;
    remoteRequested: boolean;
  }[]
> => {
  const response = await chain("query")({
    auth_friendships: [
      {
        where: {
          _or: [
            { user1: { _eq: myuserId }, user2: { _in: userIds } },
            { user1: { _in: userIds }, user2: { _eq: myuserId } },
          ],
        },
      },
      {
        are_friends: true,
        user1: true,
        user2: true,
      },
    ],
    auth_friend_requests: [
      {
        where: {
          _or: [
            { from: { _eq: myuserId }, to: { _in: userIds } },
            { from: { _in: userIds }, to: { _eq: myuserId } },
          ],
        },
      },
      {
        id: true,
        from: true,
        to: true,
      },
    ],
  });

  return userIds.map((userId) => {
    const friendship = response.auth_friendships.find(
      (x) => x.user1 === userId || x.user2 === userId
    );
    const requests = response.auth_friend_requests.find(
      (x) => x.from === userId || x.to === userId
    );

    return {
      id: userId,
      areFriends: friendship?.are_friends ? true : false,
      requested: requests?.from === myuserId ? true : false,
      remoteRequested: requests?.from === userId ? true : false,
    };
  });
};

export async function unfriend({ from, to }: { from: string; to: string }) {
  const { user1, user2 } = getSortedUsers(from, to);
  await chain("mutation")({
    update_auth_friendships: [
      {
        where: {
          user1: { _eq: user1 },
          user2: { _eq: user2 },
        },
        _set: {
          are_friends: false,
        },
      },
      { affected_rows: true },
    ],
  });
}

export async function setSpam({
  from,
  to,
  spam,
}: {
  from: string;
  to: string;
  spam: boolean;
}) {
  const { user1, user2 } = getSortedUsers(from, to);
  const updateLabel = getLabel("spam", from, to);

  // @ts-ignore
  await chain("mutation")({
    update_auth_friendships: [
      {
        where: {
          user1: { _eq: user1 },
          user2: { _eq: user2 },
        },
        _set: {
          are_friends: false,
          [updateLabel]: spam,
        },
      },
      { affected_rows: true },
    ],
  });
}

export async function setBlocked({
  from,
  to,
  block,
}: {
  from: string;
  to: string;
  block: boolean;
}) {
  const { user1, user2 } = getSortedUsers(from, to);
  const updateLabel = getLabel("blocked", from, to);
  await chain("mutation")({
    update_auth_friendships: [
      {
        where: {
          user1: { _eq: user1 },
          user2: { _eq: user2 },
        },
        _set: {
          are_friends: false,
          [updateLabel]: block,
        },
      },
      { affected_rows: true },
    ],
  });
}

export async function setFriendship({
  from,
  to,
  sendRequest,
}: {
  from: string;
  to: string;
  sendRequest: boolean;
}) {
  const { user1, user2 } = getSortedUsers(from, to);
  if (!sendRequest) {
    await chain("mutation")({
      update_auth_friendships: [
        {
          _set: {
            are_friends: false,
          },
          where: {
            user1: { _eq: user1 },
            user2: { _eq: user2 },
          },
        },
        { affected_rows: true },
      ],
    });
    await deleteFriendRequest({ from, to });
    // Delete friend request from other user to this user as well
    await deleteFriendRequest({ from: to, to: from });
    return;
  }

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
    return true;
  } else {
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

export const getAllFriends = async ({
  from,
}: {
  from: string;
}): Promise<InboxDb[]> => {
  const friends = await chain("query")({
    auth_friendships: [
      {
        where: {
          _or: [
            {
              user1: { _eq: from },
              are_friends: { _eq: true },
              user2_blocked_user1: { _neq: true },
            },
            {
              user2: { _eq: from },
              are_friends: { _eq: true },
              user1_blocked_user2: { _neq: true },
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
  return friends.auth_friendships || [];
};

export const getFriendship = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<{
  are_friends: boolean;
  request_sent: boolean;
  blocked: boolean;
  spam: boolean;
}> => {
  const { user1, user2 } = getSortedUsers(from, to);
  const spamLabel = getLabel("spam", from, to);
  const blockedLabel = getLabel("blocked", from, to);

  const existingFriendship = await chain("query")({
    auth_friendships: [
      {
        where: { user1: { _eq: user1 }, user2: { _eq: user2 } },
        limit: 1,
      },
      {
        are_friends: true,
        [spamLabel]: true,
        [blockedLabel]: true,
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
    spam: existingFriendship.auth_friendships[0]?.[spamLabel] ?? false,
    blocked: existingFriendship.auth_friendships[0]?.[blockedLabel] ?? false,
    request_sent: existingFriendship.auth_friend_requests[0] ? true : false,
  };
};

export const updateLastReadGroup = async (
  uuid: string,
  room: string,
  client_generated_uuid: string
) => {
  await chain("mutation")({
    insert_auth_collection_messages: [
      {
        objects: [
          {
            uuid,
            collection_id: room,
            last_read_message_id: client_generated_uuid,
          },
        ],
        on_conflict: {
          //@ts-ignore
          update_columns: ["last_read_message_id"],
          //@ts-ignore
          constraint: "collection_messages_pkey",
        },
      },
      { affected_rows: true },
    ],
  });
};

export const updateLastReadIndividual = async (
  user1: string,
  user2: string,
  client_generated_uuid: string,
  userIndex: "1" | "2"
) => {
  await chain("mutation")({
    update_auth_friendships: [
      {
        where: {
          user1: { _eq: user1 },
          user2: { _eq: user2 },
        },
        _set: {
          [`user${userIndex}_last_read_message_id`]: client_generated_uuid,
        },
      },
      { affected_rows: true },
    ],
  });
};

function getLabel(type: "blocked" | "spam", from: string, to: string) {
  const { user1 } = getSortedUsers(from, to);
  return user1 === from ? `user1_${type}_user2` : `user2_${type}_user1`;
}
