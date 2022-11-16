import { Chain } from "@coral-xyz/zeus";
import { HASURA_URL, JWT } from "./config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getNotifications = async (
  username: string,
  offset?: number,
  limit?: number
) => {
  const response = await chain("query")({
    auth_notifications: [
      {
        where: { username: username },
        limit,
        offset,
      },
      {
        id: true,
      },
    ],
  });
  return response.auth_notifications || [];
};
