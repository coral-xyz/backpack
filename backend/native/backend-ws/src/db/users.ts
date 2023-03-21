import { Chain } from "@coral-xyz/zeus";

import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const getUsers = async (
  userIds: string[]
): Promise<{ id: string; username: string }[]> => {
  // hotfix: empty array returns all records
  if (userIds.filter(Boolean).length === 0) return [];

  const response = await chain("query")(
    {
      auth_users: [
        {
          where: { id: { _in: userIds } },
        },
        {
          id: true,
          username: true,
        },
      ],
    },
    {
      operationName: "getUsers",
    }
  );
  return response.auth_users || [];
};
