import { LocalStorageDb } from "./db";

const STORE_KEY_USER_DATA = "user-data";

type UserData = {
  activeUser: User;
  users: Array<User>;
};

export type User = {
  username: string;
  uuid: string;
  jwt: string;
};

export async function getActiveUser(): Promise<User> {
  const data = await getUserData();
  return data.activeUser;
}

export async function setActiveUser(activeUser: User) {
  const data = await LocalStorageDb.get(STORE_KEY_USER_DATA);
  if (data == undefined || data == null) {
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

/**
 * Used to update users in storage. This is primarily used for updating the
 * cached JWT value, but may be used if usernames are made immutable in the
 * future.
 */
export async function setUser(
  uuid: string,
  updateData: Partial<User>
): Promise<User> {
  const data = await LocalStorageDb.get(STORE_KEY_USER_DATA);
  const user = data.users.find((u: User) => u.uuid === uuid);
  const updatedUser = {
    ...user,
    ...updateData,
  };
  await LocalStorageDb.set(STORE_KEY_USER_DATA, {
    activeUser: data.activeUser.uuid === uuid ? updatedUser : data.activeUser,
    users: data.users
      .filter((u: User) => u.uuid !== uuid)
      .concat([updatedUser]),
  });
  return updatedUser;
}

export async function setUserData(data: UserData) {
  await LocalStorageDb.set(STORE_KEY_USER_DATA, data);
}
