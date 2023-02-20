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
  return response.auth_users || [];
};
