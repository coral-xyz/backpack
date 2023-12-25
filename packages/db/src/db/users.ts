import { getDb } from "./index";

export const getNewUsers = async (uuid: string, uuids: string[]) => {
  const inDbUsers = await getDb(uuid).users.bulkGet(uuids);
  return uuids.filter((x) => !inDbUsers.map((x) => x?.uuid).includes(x));
};

export const bulkAddUsers = (uuid: string, users: any[]) => {
  getDb(uuid).users.bulkPut(users);
};

export const getBulkUsers = (uuid: string, uuids: string[]) => {
  return getDb(uuid).users.bulkGet(uuids);
};
