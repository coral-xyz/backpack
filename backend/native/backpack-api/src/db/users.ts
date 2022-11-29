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
        where: { username: { _in: userIds } },
      },
      {
        id: true,
        username: true,
      },
    ],
  });

  return response.auth_users;
};

export async function getUsersByPrefix({
  usernamePrefix,
}: {
  usernamePrefix: string;
}) {
  const response = await chain("query")({
    auth_users: [
      {
        where: { username: { _like: `${usernamePrefix}%` } },
      },
      {
        id: true,
        username: true,
      },
    ],
  });

  return response.auth_users || [];
}
