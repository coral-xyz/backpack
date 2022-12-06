import { LocalStorageDb } from "./db";

const STORE_KEY_USER_DATA = "user-data";

type UserData = {
  activeUser: User;
  users: Array<User>;
};

export type User = {
  username: string;
  uuid: string;
};

export async function getActiveUser(): Promise<User> {
  const data = await getUserData();
  return data.activeUser;
}

export async function setActiveUser(activeUser: User) {
  const data = await LocalStorageDb.get(STORE_KEY_USER_DATA);
  if (data === undefined) {
    await LocalStorageDb.set(STORE_KEY_USER_DATA, {
      activeUser,
      users: [activeUser],
    });
  } else {
    let isNew = !data.users.some((u: any) => u.uuid === activeUser.uuid);
    const users = isNew ? data.users.concat([activeUser]) : data.users;
    await LocalStorageDb.set(STORE_KEY_USER_DATA, {
      activeUser,
      users,
    });
  }
}

export async function getUserData(): Promise<UserData> {
  const data = await LocalStorageDb.get(STORE_KEY_USER_DATA);
  if (data === undefined) {
    throw new Error("user data not found");
  }
  return data;
}
