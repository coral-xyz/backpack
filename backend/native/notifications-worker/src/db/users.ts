import { Chain } from "@coral-xyz/zeus";

import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const getUsersFromIds = async (
  remoteUserIds: string[]
): Promise<{ username: string; id: string }[]> => {
  const response = await chain("query")({
    auth_users: [
      {
        where: {
          id: { _in: remoteUserIds },
        },
      },
      {
        id: true,
        username: true,
      },
    ],
  });
  return response.auth_users.map((x) => ({
    id: x.id as string,
    username: x.username as string,
  }));
};
