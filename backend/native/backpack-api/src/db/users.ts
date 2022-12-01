import { Chain } from "@coral-xyz/zeus";
import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getUsers = async (
  userIds: string[]
): Promise<{ username: string; id: string }[]> => {
  const response = await chain("query")({
    auth_users: [
      {
        where: { id: { _in: userIds } },
      },
      {
        id: true,
        username: true,
      },
    ],
  });

  return response.auth_users;
};

export const getUser = async (
  userId: string
): Promise<{ username: string; id: string; image: string }> => {
  const response = await chain("query")({
    auth_users: [
      {
        where: { id: { _eq: userId } },
      },
      {
        id: true,
        username: true,
      },
    ],
  });

  const user = response.auth_users[0];
  if (!user) {
    throw new Error("user not found");
  }

  return {
    username: user.username,
    id: user.id,
    image: `https://avatars.xnfts.dev/v1/${user.username}`,
  } as {
    username: string;
    id: string;
    image: string;
  };
};

export async function getUsersByPrefix({
  usernamePrefix,
  uuid,
}: {
  usernamePrefix: string;
  uuid: string;
}) {
  const response = await chain("query")({
    auth_users: [
      {
        where: {
          username: { _like: `${usernamePrefix}%` },
          id: { _neq: uuid },
        },
      },
      {
        id: true,
        username: true,
      },
    ],
  });

  return response.auth_users || [];
}
